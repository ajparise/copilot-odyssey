# 🚀 Copilot Odyssey - Experiment Architecture

## Overview

Copilot Odyssey uses a modular experiment system that lets you easily add and run experiments through an interactive CLI menu.

## Architecture

```
src/
├── index.ts              # Main entry point with interactive menu
├── types.ts              # Core interfaces and registry
└── experiments/
    ├── index.ts          # Experiment loader (register experiments here)
    ├── hello-world.ts    # Example experiment
    └── copilot-basics.ts # Example experiment
```

## How It Works

1. **Experiment Interface**: Each experiment implements the `Experiment` interface:
   ```typescript
   interface Experiment {
     name: string;          // Display name with emoji
     description: string;   // Brief description
     run: () => Promise<void>;  // Async execution function
   }
   ```

2. **Registry System**: The `ExperimentRegistry` manages all experiments and provides:
   - Registration of experiments with unique IDs
   - Retrieval of experiments by ID
   - Listing all available experiments

3. **Interactive Menu**: Built with Inquirer.js for a smooth CLI experience:
   - Select experiments from a list
   - Run experiments in isolation
   - Continue or exit after each experiment

## Adding New Experiments

1. **Create a new experiment file** in `src/experiments/`:
   ```typescript
   // src/experiments/my-experiment.ts
   import { Experiment } from '../types.js';

   export const myExperiment: Experiment = {
     name: '✨ My Experiment',
     description: 'What this experiment does',
     
     async run() {
       console.log('\n🎯 Running My Experiment...\n');
       // Your experiment code here
     },
   };
   ```

2. **Register it** in `src/experiments/index.ts`:
   ```typescript
   import { myExperiment } from './my-experiment.js';
   
   export function loadExperiments(registry: ExperimentRegistry): void {
     registry.register('my-experiment', myExperiment);
     // ... other experiments
   }
   ```

3. **Run it**: It will automatically appear in the menu!

## Best Practices

- Use descriptive emojis for visual clarity
- Keep experiments focused on one concept
- Add error handling in your experiment's `run()` function
- Use `console.log` for output (it's just a playground!)
- Import SDK modules dynamically if needed to avoid startup overhead

## Running

```bash
npm run dev    # Start the interactive menu
```

Happy experimenting! 🎯
