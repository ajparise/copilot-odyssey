import { Experiment } from '../types.js';

export const guessingGameExperiment: Experiment = {
  name: '🎮 AI Guessing Game',
  description: 'Two AI bots play a guessing game - one thinks of an object, the other asks questions',
  
  async run() {
    console.log('\n🎯 Starting AI Guessing Game...\n');
    console.log('Bot 1 will think of a random object.');
    console.log('Bot 2 will ask yes/no questions to figure it out!\n');

    try {
      const { CopilotClient } = await import('@github/copilot-sdk');
      
      // Create and start client
      const client = new CopilotClient();
      await client.start();

      // List of objects to guess from
      const objects = [
        'banana',
        'bicycle',
        'telescope',
        'coffee mug',
        'piano',
        'lighthouse',
        'hammer',
        'umbrella',
        'compass',
        'hourglass'
      ];
      
      const secretObject = objects[Math.floor(Math.random() * objects.length)];
      console.log(`🎲 Secret object selected: [HIDDEN]\n`);

      // Session 1: The "answerer" bot that knows the object
      const answererSession = await client.createSession({
        model: 'gpt-5',
        streaming: false,
        systemMessage: {
          mode: 'replace',
          content: `You are playing a guessing game. You are thinking of the object: "${secretObject}".

The other player will ask you yes/no questions to guess the object. You must:
1. Answer ONLY with "Yes", "No", or "I don't know" (if the question doesn't apply)
2. Be truthful and consistent
3. Do NOT reveal the object name
4. Keep your answers brief - just "Yes" or "No" when possible

Wait for questions and answer them honestly.`,
        }
      });

      // Session 2: The "guesser" bot that asks questions
      const guesserSession = await client.createSession({
        model: 'gpt-5',
        streaming: false,
        systemMessage: {
          mode: 'replace',
          content: `You are playing a guessing game. The other player is thinking of a common everyday object.

Your goal is to figure out what the object is by asking yes/no questions.

Strategy:
1. Start with broad category questions (Is it alive? Is it man-made? Is it bigger than a person?)
2. Narrow down based on answers
3. When you're confident, make a guess by saying "Is it a [object name]?"
4. Ask ONE question at a time
5. Keep questions clear and answerable with yes/no

Start by asking your first question.`,
        }
      });

      console.log('✅ Both AI bots are ready!\n');
      console.log('─'.repeat(60));
      console.log('\n');

      const maxTurns = 10;
      let turn = 0;
      let gameOver = false;
      let lastQuestion = '';

      // Guesser starts with first question
      console.log(`🤔 Guesser Bot: Thinking of first question...\n`);
      
      const firstQuestionDone = new Promise<string>((resolve) => {
        let fullMessage = '';
        guesserSession.on((event) => {
          if (event.type === 'assistant.message') {
            fullMessage = event.data.content;
          } else if (event.type === 'session.idle') {
            resolve(fullMessage);
          }
        });
      });

      await guesserSession.send({ prompt: 'Ask your first question to guess what object I am thinking of.' });
      const firstQuestion = await firstQuestionDone;
      
      console.log(`❓ Guesser Bot: ${firstQuestion}\n`);
      lastQuestion = firstQuestion;
      turn++;

      // Main game loop
      while (turn < maxTurns && !gameOver) {
        console.log(`Turn ${turn}/${maxTurns}`);
        console.log('─'.repeat(60));

        // Answerer responds to the question
        const answerDone = new Promise<string>((resolve) => {
          let fullMessage = '';
          answererSession.on((event) => {
            if (event.type === 'assistant.message') {
              fullMessage = event.data.content;
            } else if (event.type === 'session.idle') {
              resolve(fullMessage);
            }
          });
        });

        await answererSession.send({ prompt: lastQuestion });
        const answer = await answerDone;
        
        console.log(`✅ Answerer Bot: ${answer}\n`);

        // Check if guesser made a correct guess
        if (answer.toLowerCase().includes('yes') && 
            (lastQuestion.toLowerCase().includes(`is it a ${secretObject}`) ||
             lastQuestion.toLowerCase().includes(`is it an ${secretObject}`))) {
          console.log('🎉 Correct guess! The guesser bot wins!\n');
          gameOver = true;
          break;
        }

        // Guesser asks next question based on the answer
        const nextQuestionDone = new Promise<string>((resolve) => {
          let fullMessage = '';
          guesserSession.on((event) => {
            if (event.type === 'assistant.message') {
              fullMessage = event.data.content;
            } else if (event.type === 'session.idle') {
              resolve(fullMessage);
            }
          });
        });

        await guesserSession.send({ prompt: `The answer to your question was: "${answer}". Ask your next question.` });
        const nextQuestion = await nextQuestionDone;
        
        console.log(`❓ Guesser Bot: ${nextQuestion}\n`);
        lastQuestion = nextQuestion;
        
        turn++;
      }

      if (!gameOver) {
        console.log('─'.repeat(60));
        console.log(`\n⏱️  Game over! Maximum turns (${maxTurns}) reached.`);
        console.log(`The secret object was: ${secretObject}\n`);
      } else {
        console.log('─'.repeat(60));
        console.log(`The secret object was: ${secretObject}`);
        console.log(`It took ${turn} questions to guess it!\n`);
      }

      // Clean up
      await answererSession.destroy();
      await guesserSession.destroy();
      await client.stop();
      
    } catch (error: any) {
      console.error('❌ Failed to run guessing game:', error.message);
      if (error.message.includes('Cannot find module')) {
        console.log('Make sure @github/copilot-sdk is installed.\n');
      } else if (error.message.includes('copilot')) {
        console.log('Make sure GitHub Copilot CLI is installed and in your PATH.\n');
        console.log('Install it with: gh extension install github/gh-copilot\n');
      }
    }
  },
};
