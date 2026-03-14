import React from 'react'
import { ShieldCheck, Users, Tags, MessageSquare, Bot, GitMerge, Workflow } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from '@/components/admin/UserManagement'
import { TagManagement } from '@/components/admin/TagManagement'
import { WhatsAppConfig } from '@/components/admin/WhatsAppConfig'
import { AIStudio } from '@/components/admin/AIStudio'
import { PipelineManagement } from '@/components/admin/PipelineManagement'
import { AIFlowManagement } from '@/components/admin/AIFlowManagement'

export default function Administration() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 text-amber-500 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administração
          </h1>
          <p className="text-muted-foreground">
            Gerencie equipe, integrações, tags, pipeline e automações.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex-wrap h-auto">
          <TabsTrigger
            value="pipeline"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <GitMerge className="w-4 h-4" /> Pipeline
          </TabsTrigger>
          <TabsTrigger
            value="ai-flows"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <Workflow className="w-4 h-4" /> Fluxos IA
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <Users className="w-4 h-4" /> Equipe
          </TabsTrigger>
          <TabsTrigger
            value="tags"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <Tags className="w-4 h-4" /> Tags
          </TabsTrigger>
          <TabsTrigger
            value="whatsapp"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-amber-500 gap-2"
          >
            <Bot className="w-4 h-4" /> AI Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="m-0">
          <PipelineManagement />
        </TabsContent>

        <TabsContent value="ai-flows" className="m-0">
          <AIFlowManagement />
        </TabsContent>

        <TabsContent value="users" className="m-0">
          <UserManagement />
        </TabsContent>

        <TabsContent value="tags" className="m-0">
          <TagManagement />
        </TabsContent>

        <TabsContent value="whatsapp" className="m-0">
          <WhatsAppConfig />
        </TabsContent>

        <TabsContent value="ai" className="m-0">
          <AIStudio />
        </TabsContent>
      </Tabs>
    </div>
  )
}
