export interface Experiment {
  name: string;
  description: string;
  run: () => Promise<void>;
}

export class ExperimentRegistry {
  private experiments: Map<string, Experiment> = new Map();

  register(id: string, experiment: Experiment): void {
    this.experiments.set(id, experiment);
  }

  getAll(): Array<{ id: string; experiment: Experiment }> {
    return Array.from(this.experiments.entries()).map(([id, experiment]) => ({
      id,
      experiment,
    }));
  }

  get(id: string): Experiment | undefined {
    return this.experiments.get(id);
  }
}
