import React, { useState, useEffect, useMemo } from 'react';
import { fetchIssues, fetchProjects, searchIssues, createIssue, updateIssue } from '../services/gitlab';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { Filter, Loader2, Plus, Search, Pencil } from 'lucide-react';

export default function Dashboard() {
  const [issues, setIssues] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeClient = useStore(state => state.getGitlabClient());
  const currentUser = useStore(state => state.currentUser);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Dialog state
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [newIssueForm, setNewIssueForm] = useState({ title: '', description: '', projectId: '' });
  
  const [isEditIssueOpen, setIsEditIssueOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<any>(null);
  const [editIssueForm, setEditIssueForm] = useState({ title: '', description: '', state_event: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activeClient) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [projRes, issuesRes] = await Promise.all([
          fetchProjects(),
          searchTerm ? searchIssues(searchTerm) : fetchIssues()
        ]);
        setProjects(projRes);
        setIssues(issuesRes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(handler);
  }, [activeClient, searchTerm]);

  const filteredIssues = useMemo(() => {
    let result = issues.filter(issue => {
      if (statusFilter !== 'all' && issue.state !== statusFilter) return false;
      if (projectFilter !== 'all' && issue.project_id.toString() !== projectFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortBy === 'due_date') {
        valA = a.due_date ? new Date(a.due_date).getTime() : 0;
        valB = b.due_date ? new Date(b.due_date).getTime() : 0;
      } else if (sortBy === 'category') {
        valA = a.labels && a.labels.length > 0 ? a.labels[0].toLowerCase() : '';
        valB = b.labels && b.labels.length > 0 ? b.labels[0].toLowerCase() : '';
      } else if (sortBy === 'duration') {
        valA = a.time_stats?.total_time_spent || 0;
        valB = b.time_stats?.total_time_spent || 0;
      } else if (sortBy === 'project') {
        valA = a.project_id;
        valB = b.project_id;
      } else if (sortBy === 'user') {
        valA = a.assignee ? a.assignee.name.toLowerCase() : '';
        valB = b.assignee ? b.assignee.name.toLowerCase() : '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [issues, statusFilter, projectFilter, searchTerm, sortBy, sortDirection]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'viewer') {
      alert("Viewers cannot create issues.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newIssue = await createIssue(parseInt(newIssueForm.projectId), newIssueForm.title, newIssueForm.description);
      setIssues([newIssue, ...issues]);
      setIsNewIssueOpen(false);
      setNewIssueForm({ title: '', description: '', projectId: '' });
    } catch (err: any) {
      alert("Failed to create issue: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (issue: any) => {
    setEditingIssue(issue);
    setEditIssueForm({ 
      title: issue.title, 
      description: issue.description || '', 
      state_event: '' // reset state_event selection
    });
    setIsEditIssueOpen(true);
  };

  const handleEditIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role === 'viewer') {
      alert("Viewers cannot edit issues.");
      return;
    }

    if (!editingIssue) return;
    
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: editIssueForm.title,
        description: editIssueForm.description,
      };
      if (editIssueForm.state_event) {
        payload.state_event = editIssueForm.state_event;
      }
      
      const updatedIssue = await updateIssue(editingIssue.project_id, editingIssue.iid, payload);
      setIssues(issues.map(i => i.id === updatedIssue.id ? updatedIssue : i));
      setIsEditIssueOpen(false);
      setEditingIssue(null);
    } catch (err: any) {
      alert("Failed to edit issue: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-neutral-500">No active GitLab connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Issues <span className="text-slate-500 font-normal">Dashboard</span></h1>
        </div>

        <Dialog open={isNewIssueOpen} onOpenChange={setIsNewIssueOpen}>
          <DialogTrigger asChild>
            <Button disabled={currentUser?.role === 'viewer'} className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white border-0 font-bold">
              <Plus className="w-4 h-4" /> New Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Issue</DialogTitle>
              <DialogDescription className="text-slate-400">Add a new issue to a specific project.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateIssue} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="project" className="text-xs text-slate-400">Project</Label>
                <Select value={newIssueForm.projectId} onValueChange={v => setNewIssueForm({...newIssueForm, projectId: v})} required>
                  <SelectTrigger id="project" className="bg-slate-800 border-slate-700 text-sm">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name_with_namespace}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs text-slate-400">Title</Label>
                <Input id="title" value={newIssueForm.title} onChange={e => setNewIssueForm({...newIssueForm, title: e.target.value})} required className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-xs text-slate-400">Description</Label>
                <Textarea id="desc" value={newIssueForm.description} onChange={e => setNewIssueForm({...newIssueForm, description: e.target.value})} rows={4} className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Issue
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Issue Dialog */}
        <Dialog open={isEditIssueOpen} onOpenChange={setIsEditIssueOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Issue</DialogTitle>
              <DialogDescription className="text-slate-400">Makes changes to issue #{editingIssue?.iid}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditIssue} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-xs text-slate-400">Title</Label>
                <Input id="edit-title" value={editIssueForm.title} onChange={e => setEditIssueForm({...editIssueForm, title: e.target.value})} required className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-xs text-slate-400">Description</Label>
                <Textarea id="edit-desc" value={editIssueForm.description} onChange={e => setEditIssueForm({...editIssueForm, description: e.target.value})} rows={4} className="bg-slate-800 border-slate-700 focus-visible:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-xs text-slate-400">Quick Action</Label>
                <Select value={editIssueForm.state_event} onValueChange={v => setEditIssueForm({...editIssueForm, state_event: v})}>
                  <SelectTrigger id="edit-status" className="bg-slate-800 border-slate-700 text-sm">
                    <SelectValue placeholder="Status change..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="none" disabled>Leave as {editingIssue?.state}</SelectItem>
                    {editingIssue?.state === 'opened' && <SelectItem value="close">Close Issue</SelectItem>}
                    {editingIssue?.state === 'closed' && <SelectItem value="reopen">Reopen Issue</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditIssueOpen(false)} className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search issues, projects..." 
            className="pl-9 bg-slate-800 border-slate-700 rounded-full focus-visible:ring-indigo-500/50" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-xs">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="h-6 w-px bg-slate-800 mx-2" />
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="created_at">Start Date</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="user">Assignee</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="w-10 px-0 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 rounded-md"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20 shrink-0">
          <h2 className="font-bold">Active Issues <span className="text-slate-500 font-normal ml-2">{filteredIssues.length} total</span></h2>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400 p-8 text-center">{error}</div>
        ) : (
          <div className="overflow-auto flex-1 h-full">
            <Table>
              <TableHeader className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10 text-[10px] uppercase text-slate-500">
                <TableRow className="border-b border-slate-800 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-slate-500 w-[100px]">Status</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Issue</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Project</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Start Date</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Due Date</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Duration</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Assignee</TableHead>
                  <TableHead className="px-4 py-3 w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">No issues found.</TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 group transition-colors">
                      <TableCell className="px-4 py-4">
                        <Badge variant={issue.state === 'opened' ? 'default' : 'secondary'} className={issue.state === 'opened' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}>
                          {issue.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="font-medium text-white">{issue.title}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {issue.labels?.map((label: string) => (
                            <span key={label} className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 border-slate-700 text-slate-400">{label}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {projects.find(p => p.id === issue.project_id)?.name || issue.project_id}</span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-400 text-sm">
                        {format(parseISO(issue.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-400 text-sm">
                        {issue.due_date ? format(parseISO(issue.due_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-400 text-sm">
                        {issue.time_stats && issue.time_stats.time_estimate ? (
                           <div className="flex flex-col">
                             <span className="text-xs">Est: {issue.time_stats.human_time_estimate}</span>
                             <span className="text-xs">Spent: {issue.time_stats.human_total_time_spent || '0h'}</span>
                           </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            <img src={issue.assignee.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                            <span className="text-xs text-slate-300">{issue.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase text-slate-500 tracking-widest italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(issue)} disabled={currentUser?.role === 'viewer'} className="text-indigo-400 font-bold hover:underline text-xs disabled:opacity-50 disabled:no-underline">
                          Edit
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
