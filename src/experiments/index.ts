import { ExperimentRegistry } from '../types.js';
import { helloWorldExperiment } from './hello-world.js';
import { copilotBasicsExperiment } from './copilot-basics.js';
import { chatExperiment } from './snarky-chat.js';
import { guessingGameExperiment } from './guessing-game.js';

export function loadExperiments(registry: ExperimentRegistry): void {
  registry.register('hello-world', helloWorldExperiment);
  registry.register('copilot-basics', copilotBasicsExperiment);
  registry.register('snarky-chat', chatExperiment);
  registry.register('guessing-game', guessingGameExperiment);
  
  // Add more experiments here as you create them
  // registry.register('my-experiment', myExperiment);
}
