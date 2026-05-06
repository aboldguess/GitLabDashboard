import React, { useState } from 'react';
import { useStore, Role } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Users, Trash2, Key, Link2, UserPlus } from 'lucide-react';

export default function Settings() {
  const { instances, addInstance, removeInstance, setActiveInstance, users, addUser, updateUserRole, currentUser, setCurrentUser } = useStore();

  const [newInstance, setNewInstance] = useState({ name: '', url: '', token: '' });
  const [newUser, setNewUser] = useState({ name: '', role: 'viewer' as Role });

  const handleAddInstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInstance.name && newInstance.url && newInstance.token) {
      addInstance(newInstance);
      setNewInstance({ name: '', url: '', token: '' });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name) {
      addUser(newUser.name, newUser.role);
      setNewUser({ name: '', role: 'viewer' });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your GitLab connections and local roles.</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-auto">
        <Tabs defaultValue="instances" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 shadow-none">
            <TabsTrigger value="instances" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg py-2 px-4 flex items-center gap-2 text-slate-400">
              <Server className="w-4 h-4" /> GitLab Instances
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg py-2 px-4 flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" /> Local Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-6">
            <div className="grid gap-4">
              {instances.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-4">No instances configured. Add one below.</p>
              ) : (
                instances.map(instance => (
                  <div key={instance.id} className={`flex items-center justify-between p-4 rounded-xl border bg-slate-800/50 transition-colors ${instance.active ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-800'}`}>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white flex items-center gap-2">
                        {instance.name}
                        {instance.active && <span className="bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-indigo-500/20">Active</span>}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Link2 className="w-3 h-3" /> {instance.url}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!instance.active && (
                        <Button variant="outline" size="sm" onClick={() => setActiveInstance(instance.id)} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                          Set Active
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => removeInstance(instance.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Add New GitLab Instance
              </h3>
              <form onSubmit={handleAddInstance} className="grid sm:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs text-slate-400">Alias</Label>
                  <Input id="name" placeholder="e.g. Work GitLab, GitLab.com" value={newInstance.name} onChange={e => setNewInstance({...newInstance, name: e.target.value})} required className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50 h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-xs text-slate-400">Base URL</Label>
                  <Input id="url" type="url" placeholder="https://gitlab.com" value={newInstance.url} onChange={e => setNewInstance({...newInstance, url: e.target.value})} required className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50 h-10" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="token" className="text-xs text-slate-400">Personal Access Token</Label>
                  <Input id="token" type="password" placeholder="glpat-xxxxxxxxxxxxxxxxxxxx" value={newInstance.token} onChange={e => setNewInstance({...newInstance, token: e.target.value})} required className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50 h-10" />
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">Requires `api` or `read_api` scope.</p>
                </div>
                <div className="sm:col-span-2 flex justify-end mt-2">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6">Add Instance</Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-4">
              {users.map(user => (
                <div key={user.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border bg-slate-800/50 transition-colors ${currentUser?.id === user.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-800'}`}>
                  <div className="flex flex-col mb-4 sm:mb-0">
                    <span className="font-semibold text-white flex items-center gap-2">
                      {user.name}
                      {currentUser?.id === user.id && <span className="bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-indigo-500/20">Current</span>}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 capitalize"><Users className="w-3 h-3" /> {user.role}</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select defaultValue={user.role} onValueChange={(val: Role) => updateUserRole(user.id, val)} disabled={currentUser?.id === user.id && user.role === 'admin'}>
                      <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700 text-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    {currentUser?.id !== user.id && (
                      <Button variant="outline" size="sm" onClick={() => setCurrentUser(user)} className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 ml-auto sm:ml-0">
                        Switch To
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add Local User
              </h3>
              <form onSubmit={handleAddUser} className="grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="newUserName" className="text-xs text-slate-400">User Name</Label>
                  <Input id="newUserName" placeholder="e.g. John Doe" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50 h-10" />
                </div>
                <div className="w-full sm:w-48 space-y-2">
                  <Label className="text-xs text-slate-400">Role</Label>
                  <Select value={newUser.role} onValueChange={(val: Role) => setNewUser({...newUser, role: val})}>
                    <SelectTrigger className="h-10 bg-slate-800 border-slate-700 text-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-10 w-full sm:w-auto">Add User</Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
