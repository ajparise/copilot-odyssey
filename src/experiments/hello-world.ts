import { Experiment } from '../types.js';

export const helloWorldExperiment: Experiment = {
  name: '👋 Hello World',
  description: 'A simple hello world experiment to test the setup',
  
  async run() {
    console.log('\n🎯 Running Hello World Experiment...\n');
    console.log('Hello from Copilot SDK!');
    console.log('This is where you can test basic SDK functionality.\n');
  },
};
