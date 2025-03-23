import os
import azure.cognitiveservices.speech as speechsdk
import asyncio
import sys
import json
from azure.identity.aio import DefaultAzureCredential
from semantic_kernel.agents.azure_ai import AzureAIAgent, AzureAIAgentSettings
from dotenv import load_dotenv
from typing import List, Dict
import re

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


def format_job_positions(positions):
    """
    Formats a list of job positions into a structured format.
    Consolidates fragmented job data into complete job listings.
    """
    # If positions is a string, try to parse it as JSON
    if isinstance(positions, str):
        try:
            positions = json.loads(positions)
        except json.JSONDecodeError:
            # If it's not valid JSON, treat it as a single position
            positions = [positions]
    
    # Define default values
    default_company = "Indegene"
    default_location = "Remote (Global)"
    default_type = "Full-time"
    default_skills = ["JavaScript", "React", "Web Development"]
    
    # Group related job entries
    job_groups = []
    current_group = []
    
    for position in positions:
        # Clean up the position string if it's a string
        if isinstance(position, str):
            position = position.strip()
            
            # Check if this is the start of a new job listing
            if '{"title":' in position or '"title":' in position or position.startswith('{"'):
                # If we have a current group, save it and start a new one
                if current_group:
                    job_groups.append(current_group)
                current_group = [position]
            else:
                # Add to the current group
                current_group.append(position)
        else:
            # If it's already a dictionary, treat it as a complete job
            job_groups.append([position])
    
    # Add the last group if it exists
    if current_group:
        job_groups.append(current_group)
    
    formatted_positions = []
    
    # Process each group of related job entries
    for group in job_groups:
        job_data = {}
        
        # Extract all key-value pairs from the group
        for item in group:
            if isinstance(item, dict):
                # If it's already a dictionary, use it directly
                job_data.update(item)
                continue
                
            # Extract title
            title_match = re.search(r'"title"\s*:\s*"([^"]+)"', item)
            if title_match:
                job_data["title"] = title_match.group(1).strip()
                
            # Extract location
            location_match = re.search(r'"location"\s*:\s*"([^"]+)"', item)
            if location_match:
                job_data["location"] = location_match.group(1).strip()
                
            # Extract type
            type_match = re.search(r'"type"\s*:\s*"([^"]+)"', item)
            if type_match:
                job_data["type"] = type_match.group(1).strip()
                
            # Extract salary
            salary_match = re.search(r'"salary"\s*:\s*"([^"]+)"', item)
            if salary_match:
                job_data["salary"] = salary_match.group(1).strip()
                
            # Extract skills
            skills_match = re.search(r'"skills"\s*:\s*\[(.*?)\]', item, re.DOTALL)
            if skills_match:
                skills_str = skills_match.group(1)
                skills = re.findall(r'"([^"]+)"', skills_str)
                if skills:
                    job_data["skills"] = skills
            
            # If the item is just a skill name
            if item.strip().startswith('"') and item.strip().endswith('"'):
                skill = item.strip().strip('"')
                if "skills" not in job_data:
                    job_data["skills"] = []
                if skill not in job_data["skills"]:
                    job_data["skills"].append(skill)
        
        # If no title was found but we have skills, create a job title based on skills
        if "title" not in job_data and "skills" in job_data and job_data["skills"]:
            primary_skill = job_data["skills"][0]
            job_data["title"] = f"{primary_skill} Developer"
        
        # Clean up the title
        if "title" in job_data:
            # Remove quotes, brackets, and other artifacts
            title = job_data["title"]
            title = re.sub(r'["\[\]{}]', '', title)
            title = re.sub(r'^[-*•]\s*', '', title)  # Remove list markers
            
            # If title contains JSON properties, extract just the title
            if '"title":' in title:
                title_match = re.search(r'"title"\s*:\s*"([^"]+)"', title)
                if title_match:
                    title = title_match.group(1)
            
            # Clean up any remaining artifacts
            title = title.strip()
            if title.lower() in ["location", "type", "salary", "skills"]:
                title = "Software Developer"  # Default title for property names
                
            job_data["title"] = title
        
        # Create a structured job position with defaults for missing fields
        formatted_position = {
            "title": job_data.get("title", "Software Developer"),
            "company": job_data.get("company", default_company),
            "location": job_data.get("location", default_location),
            "type": job_data.get("type", default_type),
            "skills": job_data.get("skills", default_skills)
        }
        
        # Add salary only if present
        if "salary" in job_data:
            formatted_position["salary"] = job_data["salary"]
        
        # Only add if we have a meaningful title (not just a property name)
        if formatted_position["title"] not in ["Position", "location", "type", "salary", "skills"]:
            formatted_positions.append(formatted_position)
    
    # Deduplicate positions based on title
    unique_positions = []
    seen_titles = set()
    
    for pos in formatted_positions:
        if pos["title"] not in seen_titles:
            seen_titles.add(pos["title"])
            unique_positions.append(pos)
    
    # If we ended up with no positions, create a default one
    if not unique_positions:
        return [{
            "title": "Software Developer",
            "company": default_company,
            "location": default_location,
            "type": default_type,
            "skills": default_skills
        }]
    
    return unique_positions


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
            
            # Extract job positions from the response
            try:
                # Convert response to string and clean it up
                response_str = str(response).strip()
                
                # Check if the response looks like a list
                if response_str.startswith('[') and response_str.endswith(']'):
                    try:
                        # Try to parse as a comma-separated list
                        # Replace any missing commas between items
                        cleaned_str = response_str.replace(', ', ',').replace(' ,', ',')
                        # Add commas between items if missing
                        for job_title in ['Architect', 'Engineer', 'Developer', 'Consultant', 'Specialist']:
                            cleaned_str = cleaned_str.replace(f'] {job_title}', f'], {job_title}')
                            cleaned_str = cleaned_str.replace(f'{job_title} [', f'{job_title}, [')
                        
                        # Manual parsing as a fallback
                        if '[' in cleaned_str and ']' in cleaned_str:
                            # Remove the brackets
                            content = cleaned_str[1:-1]
                            # Split by comma
                            positions = [pos.strip() for pos in content.split(',') if pos.strip()]
                            
                            if positions:
                                formatted_response = {
                                    "status": "success",
                                    "job_positions": format_job_positions(positions)
                                }
                            else:
                                raise ValueError("No positions found in list")
                        else:
                            raise ValueError("Invalid list format")
                    except Exception as parsing_error:
                        print(f"List parsing error: {str(parsing_error)}")
                        # Fallback to treating as plain text
                        formatted_response = {
                            "status": "success",
                            "response": response_str
                        }
                else:
                    # Split the response by newlines and look for list items
                    lines = response_str.split('\n')
                    positions = []
                    
                    for line in lines:
                        line = line.strip()
                        if line and (line.startswith(('-', '*', '•')) or 
                                   any(job_type in line.lower() for job_type in ['architect', 'engineer', 'developer', 'consultant'])):
                            # Clean up the line
                            clean_line = line.lstrip('-*•').strip()
                            if clean_line:
                                positions.append(clean_line)
                    
                    if positions:
                        formatted_response = {
                            "status": "success",
                            "job_positions": format_job_positions(positions)
                        }
                    else:
                        # If no positions found, just return the response as is
                        formatted_response = {
                            "status": "success",
                            "response": response_str
                        }
            except Exception as e:
                print(f"Error formatting response: {str(e)}")
                # Fallback to plain text response
                formatted_response = {
                    "status": "success",
                    "response": str(response)
                }
            
            result["steps"].append({
                "step": "agent_query",
                "status": "success",
                "response": formatted_response
            })
            result["agent_response"] = formatted_response
            return formatted_response

    except Exception as e:
        error_response = {
            "status": "error",
            "error": str(e)
        }
        result["steps"].append({
            "step": "agent_query",
            "status": "error",
            "error": str(e)
        })
        result["agent_response"] = error_response
        return error_response


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
