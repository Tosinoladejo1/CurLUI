

PROJECT=Backend/ApiIntegrationUtility.csproj
TEST_PROJECT=Backend/ApiIntegrationUtility.Tests/ApiIntegrationUtility.Tests.csproj

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

help:
	@echo "Available commands:"
	@echo "  build   - Compile the API project"
	@echo "  run     - Run the API project"
	@echo "  test    - Run unit tests"
	@echo "  clean   - Clean the project"
	@echo "  watch   - Watch files and hot-reload on changes"
