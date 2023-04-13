package main

import (
	"math/rand"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	H "github.com/highlight/highlight/sdk/highlight-go"
	hlog "github.com/highlight/highlight/sdk/highlight-go/log"
	highlightFiber "github.com/highlight/highlight/sdk/highlight-go/middleware/fiber"
	e "github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

func main() {
	H.SetProjectID("1jdkoe52")
	H.SetGraphqlClientAddress("https://localhost:8083/public")
	H.SetOTLPEndpoint("http://localhost:4318")
	H.Start()
	defer H.Stop()
	hlog.Init()

	app := fiber.New()
	app.Use(logger.New())
	app.Use(highlightFiber.Middleware())

	app.Get("/", func(c *fiber.Ctx) error {
		logrus.WithContext(c.Context()).Infof("hello from highlight.io")
		if rand.Float64() < 0.2 {
			return e.New("random error from go fiber!")
		}
		return c.SendString("Hello, World!")
	})

	logrus.Fatal(app.Listen(":3456"))
}
