import { useState, useEffect } from 'react';
import { fetchProjects } from '../services/gitlab';
import { useStore } from '../store/useStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeClient = useStore(state => state.getGitlabClient());

  useEffect(() => {
    if (!activeClient) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projRes = await fetchProjects();
        setProjects(projRes);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeClient]);

  if (!activeClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-neutral-500">No active GitLab connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Projects</h1>
          <p className="text-xs text-slate-400 mt-1">View connected projects that you have membership in.</p>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20 shrink-0">
          <h2 className="font-bold">Active Projects <span className="text-slate-500 font-normal ml-2">{projects.length} total</span></h2>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 p-8 text-center">{error}</div>
        ) : (
          <div className="overflow-auto flex-1 h-full">
            <Table>
              <TableHeader className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10 text-[10px] uppercase text-slate-500">
                <TableRow className="border-b border-slate-800 hover:bg-transparent">
                  <TableHead className="px-4 py-3 text-slate-500">Project Name</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Visibility</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500">Created At</TableHead>
                  <TableHead className="px-4 py-3 text-slate-500 text-right">Stars</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">No projects found.</TableCell>
                  </TableRow>
                ) : (
                  projects.map((proj) => (
                    <TableRow key={proj.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 group transition-colors">
                      <TableCell className="px-4 py-4">
                        <div className="font-medium text-white">{proj.name_with_namespace}</div>
                        <a href={proj.web_url} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 font-bold hover:underline">
                          View on GitLab
                        </a>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge variant="outline" className="capitalize bg-slate-800 border-slate-700 text-slate-300">{proj.visibility}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-slate-400 text-sm">
                        {proj.created_at ? format(parseISO(proj.created_at), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right text-slate-400 text-sm">
                        {proj.star_count}
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
