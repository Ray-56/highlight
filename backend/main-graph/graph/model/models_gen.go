// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
	"time"
)

type DateRangeInput struct {
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
}

type SearchParamsInput struct {
	UserProperties     []*UserPropertyInput `json:"user_properties"`
	ExcludedProperties []*UserPropertyInput `json:"excluded_properties"`
	TrackProperties    []*UserPropertyInput `json:"track_properties"`
	DateRange          *DateRangeInput      `json:"date_range"`
	Os                 *string              `json:"os"`
	Browser            *string              `json:"browser"`
	VisitedURL         *string              `json:"visited_url"`
	Referrer           *string              `json:"referrer"`
	Identified         *bool                `json:"identified"`
}

type UserPropertyInput struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Plan string

const (
	PlanNone       Plan = "None"
	PlanBasic      Plan = "Basic"
	PlanStartup    Plan = "Startup"
	PlanEnterprise Plan = "Enterprise"
)

var AllPlan = []Plan{
	PlanNone,
	PlanBasic,
	PlanStartup,
	PlanEnterprise,
}

func (e Plan) IsValid() bool {
	switch e {
	case PlanNone, PlanBasic, PlanStartup, PlanEnterprise:
		return true
	}
	return false
}

func (e Plan) String() string {
	return string(e)
}

func (e *Plan) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Plan(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Plan", str)
	}
	return nil
}

func (e Plan) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
