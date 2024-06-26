package utils

import "time"

type DigestsInput struct {
	AsOf   time.Time `json:"asOf"`
	DryRun bool      `json:"dryRun"`
}

type ProjectIdResponse struct {
	ProjectId int       `json:"projectId"`
	DryRun    bool      `json:"dryRun"`
	End       time.Time `json:"end"`
	Start     time.Time `json:"start"`
}

type InterestingSessionSql struct {
	UserProperties string        `json:"userProperties"`
	Identifier     string        `json:"identifier"`
	Fingerprint    string        `json:"fingerprint"`
	Country        string        `json:"country"`
	ActiveLength   time.Duration `json:"activeLength"`
	SecureId       string        `json:"secureId"`
	Id             int           `json:"id"`
	ChunkIndex     int           `json:"chunkIndex"`
	EventCounts    string        `json:"eventCounts"`
}

type InterestingSession struct {
	Identifier       string   `json:"identifier"`
	AvatarUrl        string   `json:"avatarUrl"`
	Country          string   `json:"country"`
	ActiveLength     string   `json:"activeLength"`
	Url              string   `json:"url"`
	ScreenshotUrl    string   `json:"screenshotUrl"`
	ActivityGraphUrl string   `json:"activityGraphUrl"`
	Insights         []string `json:"insights"`
	Id               int      `json:"id"`
	ChunkIndex       int      `json:"chunkIndex"`
	EventCounts      string   `json:"eventCounts"`
}

type SessionInsightsData struct {
	ProjectId           int                  `json:"projectId"`
	EndFmt              string               `json:"endFmt"`
	StartFmt            string               `json:"startFmt"`
	ProjectName         string               `json:"projectName"`
	UseHarold           bool                 `json:"useHarold"`
	InterestingSessions []InterestingSession `json:"interestingSessions"`
	DryRun              bool                 `json:"dryRun"`
	ToEmail             string               `json:"toEmail"`
	UnsubscribeUrl      string               `json:"unsubscribeUrl"`
}
