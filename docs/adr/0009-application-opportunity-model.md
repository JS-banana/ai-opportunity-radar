# Application opportunity model

The app will map Feishu Base records into a stable internal `ActivityOpportunity` model before rendering. Chinese Base field names stay at the Feishu adapter boundary, keeping UI code and future clients independent from Base column naming while avoiding a heavier domain model than the MVP needs.
