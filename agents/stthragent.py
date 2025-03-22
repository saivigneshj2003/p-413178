import os
import azure.cognitiveservices.speech as speechsdk
import asyncio
import sys
import json
from azure.identity.aio import DefaultAzureCredential
from semantic_kernel.agents.azure_ai import AzureAIAgent, AzureAIAgentSettings
from dotenv import load_dotenv


load_dotenv()

service_region = os.getenv("AZURE_SPEECH_REGION")
speech_key = os.getenv("AZURE_SPEECH_KEY")
MODEL_DEPLOYMENT_NAME = os.getenv("AZURE_AI_AGENT_MODEL_DEPLOYMENT_NAME")
PROJECT_CONNECTION_STRING = os.getenv("AZURE_AI_AGENT_PROJECT_CONNECTION_STRING")
AGENT_ID = os.getenv("AZURE_TestUserAgent_ID")

# Default audio path (will be overridden if a path is provided as command line argument)
audiopath = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "audiofile.wav")

# Check if a custom audio path was provided as a command line argument
if len(sys.argv) > 1:
    audiopath = sys.argv[1]

result = {
    "status": "processing",
    "steps": [],
    "error": None,
    "speech_text": None,
    "agent_response": None
}

result["steps"].append({
    "step": "initialization",
    "status": "info",
    "message": f"Using audio file: {audiopath}"
})


def recognize_from_microphone_audio():
    """
    Captures speech from the microphone, converts it to text using Azure Speech Service,
    and returns the recognized text.
    """
    try:
        # Create a SpeechConfig object with the Azure Speech Service credentials
        speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)

        # Set the language for speech recognition
        speech_config.speech_recognition_language = "en-US"

        audio_config = speechsdk.audio.AudioConfig(filename=audiopath)

        # Create a SpeechRecognizer object with the speech and audio configurations
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        # Start speech recognition asynchronously and wait for the result
        speech_recognition_result = speech_recognizer.recognize_once_async().get()

        # Check the result
        if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
            result["steps"].append({
                "step": "speech_recognition",
                "status": "success",
                "text": speech_recognition_result.text
            })
            result["speech_text"] = speech_recognition_result.text
            return speech_recognition_result.text
        elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
            error_details = speechsdk.NoMatchDetails(speech_recognition_result)
            result["steps"].append({
                "step": "speech_recognition",
                "status": "error",
                "error": "No speech could be recognized",
                "details": str(error_details.reason)
            })
            return None
        elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = speechsdk.CancellationDetails(speech_recognition_result)
            result["steps"].append({
                "step": "speech_recognition",
                "status": "error",
                "error": "Speech recognition canceled",
                "details": str(cancellation_details.reason)
            })
            return None
    except Exception as e:
        result["steps"].append({
            "step": "speech_recognition",
            "status": "error",
            "error": str(e)
        })
        return None


async def query_agent(user_query: str):
    """
    Interacts with the Azure AI agent using the recognized text as input.
    """
    try:
        # Set up the agent configuration
        ai_agent_settings = AzureAIAgentSettings(
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            project_connection_string=PROJECT_CONNECTION_STRING
        )

        # Authenticate and create the client
        async with (
            DefaultAzureCredential() as creds,
            AzureAIAgent.create_client(credential=creds, settings=ai_agent_settings) as client,
        ):
            # Retrieve the agent definition based on the assistant ID
            agent_definition = await client.agents.get_agent(agent_id=AGENT_ID)

            # Create the Semantic Kernel agent using the retrieved definition
            agent = AzureAIAgent(client=client, definition=agent_definition)

            # Create a new conversation thread
            thread = await client.agents.create_thread()

            # Add the user's query to the conversation
            await agent.add_chat_message(thread_id=thread.id, message=user_query)

            # Get the agent's response
            response = await agent.get_response(thread_id=thread.id)
            
            result["steps"].append({
                "step": "agent_query",
                "status": "success",
                "response": str(response)
            })
            result["agent_response"] = str(response)
            return response

    except Exception as e:
        result["steps"].append({
            "step": "agent_query",
            "status": "error",
            "error": str(e)
        })
        return None


async def main():
    try:
        # First, recognize speech from the audio file
        recognized_text = recognize_from_microphone_audio()
        
        if recognized_text:
            # Then, query the agent with the recognized text
            agent_response = await query_agent(recognized_text)
            
            if agent_response:
                result["status"] = "success"
            else:
                result["status"] = "error"
                result["error"] = "Failed to get agent response"
        else:
            result["status"] = "error"
            result["error"] = "Failed to recognize speech"
            
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
    
    # Output the final result as a single JSON object
    print(json.dumps(result))


if __name__ == "__main__":
    asyncio.run(main())
