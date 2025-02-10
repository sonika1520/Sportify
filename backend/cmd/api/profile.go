package main

import (
	"log"
	"net/http"

	"github.com/MishNia/Sportify.git/internal/store"
)

type ProfilePayload struct {
	FirstName       string   `json:"first_name" validate:"required"`
	LastName        string   `json:"last_name" validate:"required"`
	Email           string   `json:"email" validate:"required,email"`
	Age             int      `json:"age" validate:"required"`
	Gender          string   `json:"gender" validate:"required"`
	SportPreference []string `json:"sport_preference" validate:"required"`
}

func (app *application) createUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	var payload ProfilePayload

	if err := readJSON(w, r, &payload); err != nil {
		log.Println(err.Error())
		app.badRequestResponse(w, r, err)
		return
	}

	log.Println("Received profile create request")

	profile := &store.Profile{
		Email:           payload.Email,
		FirstName:       payload.FirstName,
		LastName:        payload.LastName,
		Age:             payload.Age,
		Gender:          payload.Gender,
		SportPreference: payload.SportPreference,
	}

	ctx := r.Context()

	user, err := app.store.Users.GetByEmail(ctx, payload.Email)

	if err != nil {
		if err == store.ErrNotFound {
			log.Printf("User %s not found", user.Email)

			app.badRequestResponse(w, r, ErrInvalidCredentials)
		} else {
			app.internalServerError(w, r, err)
		}
		return
	}

	log.Printf("Found user with email %s", user.Email)

	errCreate := app.store.Profile.Create(ctx, profile)

	if errCreate != nil {
		log.Println(errCreate.Error())
		app.internalServerError(w, r, errCreate)
		return
	}

	if errCreate := app.jsonResponse(w, http.StatusCreated, map[string]string{"message": "Success"}); errCreate != nil {
		app.internalServerError(w, r, errCreate)
	}
}
