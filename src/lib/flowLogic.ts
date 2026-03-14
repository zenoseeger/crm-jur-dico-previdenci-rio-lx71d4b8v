import { Lead, Task, AIFlow } from '@/types'

export function processTagsForFlows(
  lead: Lead,
  newTags: string[],
  currentTasks: Task[],
  currentActiveFlows: { flowId: string; currentStepOrder: number }[],
  aiFlows: AIFlow[],
) {
  let tasks = [...currentTasks]
  let activeFlows = [...currentActiveFlows]
  let tagsAdded = newTags.filter((t) => !lead.tags.includes(t))

  tagsAdded.forEach((tag) => {
    const flow = aiFlows.find((f) => f.triggerTagName === tag)
    if (flow && flow.steps.length > 0 && !activeFlows.some((af) => af.flowId === flow.id)) {
      activeFlows.push({ flowId: flow.id, currentStepOrder: 1 })
      const firstStep = flow.steps.find((s) => s.order === 1) || flow.steps[0]
      if (firstStep) {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + firstStep.dueInDays)
        tasks.push({
          id: `task_ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title: `Follow-up: ${flow.name} (Etapa ${firstStep.order})`,
          description: `[Gerado por IA]: ${firstStep.prompt}`,
          completed: false,
          createdAt: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          flowId: flow.id,
          stepOrder: firstStep.order,
        })
      }
    }
  })
  return { tasks, activeFlows }
}

export function processTaskCompletionForFlows(
  taskId: string,
  currentTasks: Task[],
  currentActiveFlows: { flowId: string; currentStepOrder: number }[],
  aiFlows: AIFlow[],
) {
  let tasks = currentTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
  let activeFlows = [...currentActiveFlows]
  const completedTask = tasks.find((t) => t.id === taskId)

  if (
    completedTask &&
    completedTask.completed &&
    completedTask.flowId &&
    completedTask.stepOrder !== undefined
  ) {
    const flow = aiFlows.find((f) => f.id === completedTask.flowId)
    if (flow) {
      const nextStep = flow.steps.find((s) => s.order === completedTask.stepOrder! + 1)
      if (nextStep) {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + nextStep.dueInDays)
        tasks.push({
          id: `task_ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title: `Follow-up: ${flow.name} (Etapa ${nextStep.order})`,
          description: `[Gerado por IA]: ${nextStep.prompt}`,
          completed: false,
          createdAt: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          flowId: flow.id,
          stepOrder: nextStep.order,
        })
        activeFlows = activeFlows.map((af) =>
          af.flowId === flow.id ? { ...af, currentStepOrder: nextStep.order } : af,
        )
      } else {
        activeFlows = activeFlows.filter((af) => af.flowId !== flow.id)
      }
    }
  }
  return { tasks, activeFlows }
}
