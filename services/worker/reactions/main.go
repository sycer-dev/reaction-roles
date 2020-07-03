package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/machinebox/graphql"
	"github.com/spec-tacles/go/broker"
	"github.com/spec-tacles/go/rest"
	"github.com/spec-tacles/go/types"
	"golang.org/x/net/context"
)

var (
	gql     = graphql.NewClient("http://localhost:4000/graphql")
	discord = rest.NewClient(os.Getenv("DISCORD_TOKEN"))
	events  = []string{"MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"}
)

var req = graphql.NewRequest(`
	query ($id: String!, $emoji: String!) {
		find(message_id: $id, emoji: $emoji) {
			emoji
		}
	}
`)

// Response represents the reaction role response
type Response struct {
	Find []struct {
		Emoji string
	}
}

// GatewayEmoji represents a gateway emoji
type GatewayEmoji struct {
	ID       *string `json:"id"`
	Name     *string `json:"name"`
	Animated *bool   `json:"animated"`
}

// MessageReactionAdd represents a message reaction add
type MessageReactionAdd struct {
	UserID    string             `json:"user_id"`
	ChannelID string             `json:"channel_id"`
	MessageID string             `json:"message_id"`
	GuildID   string             `json:"guild_id"`
	Member    *types.GuildMember `json:"member"`
	Emoji     GatewayEmoji       `json:"emoji"`
}

// MessageReactionRemove represents a message reaction add
type MessageReactionRemove struct {
	UserID    string       `json:"user_id"`
	ChannelID string       `json:"channel_id"`
	MessageID string       `json:"message_id"`
	GuildID   string       `json:"guild_id"`
	Emoji     GatewayEmoji `json:"emoji"`
}

func main() {
	amqp := broker.NewAMQP("gateway", "", ingest)

	err := amqp.Connect("amqp://fyko:doctordoctor@localhost//")
	if err != nil {
		log.Fatalf("An error occurred when trying to connect to RabbtiMQ: %+v", err)
	}

	for _, event := range events {
		go func(event string) {
			err := amqp.Subscribe(event)

			if err != nil {
				log.Fatalf("An error occurred when trying to listen to event '%+s': %+v", event, err)
			}
		}(event)

		log.Printf("Successfully subscribed to event '%+s'", event)
	}

	select {}
}

func ingest(event string, bytes []byte) {
	if event == "MESSAGE_REACTION_ADD" {
		data := &MessageReactionAdd{}
		err := json.Unmarshal(bytes, &data)

		if err != nil {
			log.Printf("Error when unmarshalling MESSAGE_REACTION_ADD data: %v", err)
			return
		}

		handleAdd(data)
	}

	if event == "MESSAGE_REACTION_REMOVE" {
		data := &MessageReactionRemove{}

		err := json.Unmarshal(bytes, &data)

		if err != nil {
			log.Printf("Error when unmarshalling MESSAGE_REACTION_REMOVE data: %v", err)
			return
		}

		handleRemove(data)
	}
}

func handleAdd(data *MessageReactionAdd) {
	var emoji string
	if data.Emoji.ID != nil {
		emoji = *data.Emoji.ID
	} else {
		emoji = *data.Emoji.Name
	}

	req.Var("id", data.MessageID)
	req.Var("emoji", emoji)

	var res Response
	err := gql.Run(context.Background(), req, &res)

	if err != nil {
		log.Printf("Error when fetching a reaction role: %v", err)
		return
	}

	for _, entry := range res.Find {
		log.Println(entry.Emoji)
	}
}

func handleRemove(data *MessageReactionRemove) {
	var emoji string
	if data.Emoji.ID != nil {
		emoji = *data.Emoji.ID
	} else {
		emoji = *data.Emoji.Name
	}

	req.Var("id", data.MessageID)
	req.Var("emoji", emoji)

	var res Response
	err := gql.Run(context.Background(), req, &res)

	if err != nil {
		log.Printf("Error when fetching a reaction role: %v", err)
		return
	}

	for _, entry := range res.Find {
		log.Println(entry.Emoji)
	}
}
