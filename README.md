# Search Car by Year / Generate description with AI for car

A simple page that lets you:

- Select a **Year -> Make -> Model** via the NHTSA vPIC API
- See a “You picked: 2022 HONDA Civic” confirmation
- Get an AI-generated using Deepseek about the car capabilities in a quarter-mile

## URL

## APIs Used

- **NHTSA vPIC API**
  - `/vehicles/GetAllMakes?format=json`
  - `/vehicles/GetModelsForMake/{make}?format=json`
  - Docs: https://vpic.nhtsa.dot.gov/api/
- **OpenRouter / DeepSeek AI**
  - `POST /api/v1/chat/completions` with model `deepseek/deepseek-r1-0528:free`
  - Docs: https://openrouter.ai/deepseek/deepseek-r1-0528:free

## Setup & Run Locally

- **Clone** this repo:
  ```
  git clone https://github.com/<your-username>/<repo-name>.git
  cd <repo-name>
  ```
