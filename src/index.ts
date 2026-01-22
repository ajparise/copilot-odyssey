import prompts from 'prompts';
import { ExperimentRegistry } from './types.js';
import { loadExperiments } from './experiments/index.js';

async function main() {
  console.clear();
  console.log('🚀 Welcome to Copilot Odyssey!');
  console.log('═══════════════════════════════\n');

  const registry = new ExperimentRegistry();
  loadExperiments(registry);

  let shouldContinue = true;

  while (shouldContinue) {
    const experiments = registry.getAll();
    
    const choices = [
      ...experiments.map(({ id, experiment }) => ({
        title: `${experiment.name} - ${experiment.description}`,
        value: id,
      })),
      { title: '🚪 Exit', value: 'exit' },
    ];

    const response = await prompts({
      type: 'select',
      name: 'action',
      message: 'Choose an experiment to run:',
      choices,
    });

    if (!response.action || response.action === 'exit') {
      console.log('\n👋 Thanks for experimenting! See you next time.\n');
      break;
    }

    const experiment = registry.get(response.action);
    if (experiment) {
      try {
        await experiment.run();
      } catch (error) {
        console.error('❌ Experiment failed:', error);
      }

      const continueResponse = await prompts({
        type: 'confirm',
        name: 'continue',
        message: 'Run another experiment?',
        initial: true,
      });

      if (!continueResponse.continue) {
        console.log('\n👋 Thanks for experimenting! See you next time.\n');
        shouldContinue = false;
      } else {
        console.clear();
        console.log('🚀 Welcome to Copilot Odyssey!');
        console.log('═══════════════════════════════\n');
      }
    }
  }
}

main().catch(console.error);



