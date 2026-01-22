import { Experiment } from '../types.js';
import prompts from 'prompts';

export const chatExperiment: Experiment = {
  name: '💬 Chat with Snarky GPT-5 Model',
  description: 'Interactive chat session with a Copilot model',
  
  async run() {
    console.log('\n🎯 Starting Chat Session...\n');
    console.log('Type your messages below. Type "exit" or press Ctrl+C to quit.\n');

    try {
      const { CopilotClient } = await import('@github/copilot-sdk');
      
      // Create and start client
      const client = new CopilotClient();
      await client.start();

      // Create a session with streaming enabled
      const session = await client.createSession({
        model: 'gpt-5',
        streaming: true,
        systemMessage: {
          mode: 'replace',
          content: `You are quirky and fun assistant but you are kind of a jerk and use snarky language.`,
        }
      });

      console.log('✅ Connected to Copilot!\n');

      let chatting = true;
      while (chatting) {
        const response = await prompts({
          type: 'text',
          name: 'message',
          message: 'You:',
        });

        if (!response.message || response.message.toLowerCase() === 'exit') {
          console.log('\n👋 Ending chat session...\n');
          break;
        }

        try {
          console.log('\n🤖 Assistant: ');
          
          // Handle streaming response
          const done = new Promise<void>((resolve) => {
            const unsubscribe = session.on((event) => {
              if (event.type === 'assistant.message_delta') {
                // Stream message chunks as they arrive
                process.stdout.write(event.data.deltaContent);
              } else if (event.type === 'session.idle') {
                // Session finished processing
                console.log('\n');
                unsubscribe(); // Clean up the event handler!
                resolve();
              }
            });
          });

          // Send message and wait for completion
          await session.send({ prompt: response.message });
          await done;
          
        } catch (error: any) {
          console.error('\n❌ Error:', error.message);
          console.log('');
        }
      }

      // Clean up
      await session.destroy();
      await client.stop();
      
    } catch (error: any) {
      console.error('❌ Failed to initialize chat:', error.message);
      if (error.message.includes('Cannot find module')) {
        console.log('Make sure @github/copilot-sdk is installed.\n');
      } else if (error.message.includes('copilot')) {
        console.log('Make sure GitHub Copilot CLI is installed and in your PATH.\n');
        console.log('Install it with: gh extension install github/gh-copilot\n');
      }
    }
  },
};
