using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using System.ComponentModel;
using System.Text.Json.Serialization;

namespace AiHub
{
	public class Program
	{
		static async Task Main(string[] args)
		{
			// Populate values from your OpenAI deployment
			var modelId = "openai/gpt-4o-mini";
			var endpoint = "https://ai.liara.ir/api/v1/68263172c55e95700816d2b4";
			var apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2M2FkMDBlMTM2ODJiZDBlNjFiNjI5NTciLCJ0eXBlIjoiYXV0aCIsImlhdCI6MTc0NzMzMzc1OH0.qJQvhy4C3Ma4mkT4nt_JDnsbLiqys7kHz44c-RFZQz0";

			// Create a kernel with Azure OpenAI chat completion
			// var builder = Kernel.CreateBuilder().AddOpenAIChatCompletion(modelId, endpoint, apiKey);
			var builder = Kernel.CreateBuilder();

			builder.AddOpenAIChatCompletion(
				modelId: modelId,
				endpoint: new Uri(endpoint),
				apiKey: apiKey
			);


			// Add enterprise components
			builder.Services.AddLogging(services => services.AddConsole().SetMinimumLevel(LogLevel.Trace));

			// Build the kernel
			Kernel kernel = builder.Build();
			var chatCompletionService = kernel.GetRequiredService<IChatCompletionService>();

			// Add a plugin (the LightsPlugin class is defined below)
			kernel.Plugins.AddFromType<LightsPlugin>("Lights");

			// Enable planning
			OpenAIPromptExecutionSettings openAIPromptExecutionSettings = new()
			{
				FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
			};

			// Create a history store the conversation
			var history = new ChatHistory();

			// Initiate a back-and-forth chat
			string? userInput;
			do
			{
				// Collect user input
				Console.Write("User > ");
				userInput = Console.ReadLine();

				// Add user input
				history.AddUserMessage(userInput ?? string.Empty);

				// Get the response from the AI
				var result = await chatCompletionService.GetChatMessageContentAsync(
					history,
					executionSettings: openAIPromptExecutionSettings,
					kernel: kernel);

				// Print the results
				Console.WriteLine("Assistant > " + result);

				// Add the message from the agent to the chat history
				history.AddMessage(result.Role, result.Content ?? string.Empty);
			} while (userInput is not null);
		}
	}
	public class LightsPlugin
	{
		// Mock data for the lights
		private readonly List<LightModel> lights = new()
		{
			new LightModel { Id = 1, Name = "Table Lamp", IsOn = false },
			new LightModel { Id = 2, Name = "Porch light", IsOn = false },
			new LightModel { Id = 3, Name = "Chandelier", IsOn = true }
		};

        [KernelFunction("get_lights")]
        [Description("Gets a list of lights and their current state")]
        public List<LightModel> GetLights()
        {
            return lights;
        }

        [KernelFunction("change_state")]
        [Description("Changes the state of the light")]
        public LightModel? ChangeState(int id, bool isOn)
        {
            var light = lights.FirstOrDefault(light => light.Id == id);

            if (light == null)
            {
                return null;
            }

            // Update the light with the new state
            light.IsOn = isOn;

            return light;
        }
    }

	public class LightModel
	{
		[JsonPropertyName("id")]
		public int Id { get; set; }

		[JsonPropertyName("name")]
		public required string Name { get; set; }

		[JsonPropertyName("is_on")]
		public bool? IsOn { get; set; }
	}
}
