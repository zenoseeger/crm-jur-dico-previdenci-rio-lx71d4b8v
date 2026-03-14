import React from 'react'
import { ShieldCheck, Users, Tags, MessageSquare, Bot } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserManagement } from '@/components/admin/UserManagement'
import { TagManagement } from '@/components/admin/TagManagement'
import { WhatsAppConfig } from '@/components/admin/WhatsAppConfig'
import { AIStudio } from '@/components/admin/AIStudio'

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
            Gerencie equipe, integrações, tags e configurações da IA.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
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
