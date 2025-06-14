

PROJECT=Backend/ApiIntegrationUtility.csproj
TEST_PROJECT=Backend/ApiIntegrationUtility.Tests/ApiIntegrationUtility.Tests.csproj
.PHONY: frontend backend dev clean-images help


build:
	dotnet build $(PROJECT)

run:
	dotnet run --project $(PROJECT)

test:
	dotnet test $(TEST_PROJECT)

clean:
	dotnet clean $(PROJECT)

watch:
	dotnet watch --project $(PROJECT)

frontend-build:
	docker build -t api-frontend -f Frontend/Dockerfile Frontend

frontend-run:
	docker run --rm -it \
		-p 5173:5173 \
		-v ${PWD}/Frontend:/app \
		-w /app \
		-e CHOKIDAR_USEPOLLING=true \
		api-frontend \
		sh -c "npm install && npm run dev"

		
help:
	@echo "Available commands:"
	@echo "  build   - Compile the API project"
	@echo "  run     - Run the API project"
	@echo "  test    - Run unit tests"
	@echo "  clean   - Clean the project"
	@echo "  watch   - Watch files and hot-reload on changes"
