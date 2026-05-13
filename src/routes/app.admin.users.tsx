import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, setUserRole, setUserBanned, deleteUser } from "@/server/admin-users.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Ban, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/admin/users")({ component: AdminUsersPage });

function AdminUsersPage() {
  const { isAdmin, loading, user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/app/dashboard" });
  }, [isAdmin, loading, nav]);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listUsers(),
    enabled: isAdmin,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const roleM = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "viewer" }) => setUserRole({ data: v }),
    onMutate: (v) => setPendingId(v.userId),
    onSuccess: () => { toast.success("Ruolo aggiornato"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setPendingId(null),
  });

  const banM = useMutation({
    mutationFn: (v: { userId: string; banned: boolean }) => setUserBanned({ data: v }),
    onMutate: (v) => setPendingId(v.userId),
    onSuccess: (_d, v) => { toast.success(v.banned ? "Utente disabilitato" : "Utente riattivato"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setPendingId(null),
  });

  const delM = useMutation({
    mutationFn: (v: { userId: string }) => deleteUser({ data: v }),
    onMutate: (v) => setPendingId(v.userId),
    onSuccess: () => { toast.success("Utente eliminato"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setPendingId(null),
  });

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Admin · Utenti</h1>
        <p className="text-muted-foreground">Gestione delle utenze: ruolo, disabilitazione, eliminazione.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Elenco utenti</CardTitle>
          <CardDescription>{users?.length ?? 0} utenti registrati.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Caricamento…</div>}
          {error && <div className="text-destructive text-sm">{(error as Error).message}</div>}
          {users && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">UserId WarEra</th>
                    <th className="py-2 pr-3">API Key</th>
                    <th className="py-2 pr-3 text-right">Chiamate</th>
                    <th className="py-2 pr-3">Ruolo</th>
                    <th className="py-2 pr-3">Stato</th>
                    <th className="py-2 pr-3">Creato</th>
                    <th className="py-2 pr-3">Ultimo accesso</th>
                    <th className="py-2 pr-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = (u.roles[0] ?? "viewer") as "admin" | "viewer";
                    const isMe = u.id === user?.id;
                    const busy = pendingId === u.id;
                    return (
                      <tr key={u.id} className="border-b border-border/40">
                        <td className="py-2 pr-3 font-medium">{u.profile?.name ?? "—"}{isMe && <span className="ml-2 text-xs text-muted-foreground">(tu)</span>}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{u.email}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{u.profile?.warera_user_id ?? "—"}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-muted-foreground break-all max-w-[260px] whitespace-normal">
                          {u.profile?.api_key ?? "—"}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{(u.profile as any)?.api_call_count ?? 0}</td>
                        <td className="py-2 pr-3">
                          <Select
                            value={role}
                            disabled={busy || isMe}
                            onValueChange={(v) => roleM.mutate({ userId: u.id, role: v as "admin" | "viewer" })}
                          >
                            <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 pr-3">
                          {u.is_banned
                            ? <Badge variant="destructive">Disabilitato</Badge>
                            : <Badge variant="secondary">Attivo</Badge>}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                          {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={u.is_banned ? "outline" : "secondary"}
                              disabled={busy || isMe}
                              onClick={() => banM.mutate({ userId: u.id, banned: !u.is_banned })}
                            >
                              {u.is_banned ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                              <span className="ml-1">{u.is_banned ? "Riattiva" : "Disabilita"}</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" disabled={busy || isMe}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminare utente?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    L'utente <b>{u.email}</b> verrà eliminato definitivamente. L'operazione non è reversibile.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => delM.mutate({ userId: u.id })}>Elimina</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
