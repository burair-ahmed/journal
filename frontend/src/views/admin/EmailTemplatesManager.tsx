
import React, { useState } from 'react';
import { useEmailTemplates, useCreateEmailTemplate, useUpdateEmailTemplate, useDeleteEmailTemplate, EmailTemplateFormData, EmailTemplate } from '../../hooks/useEmailTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Code } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const EmailTemplatesManager = () => {
  const { data: templates, isLoading } = useEmailTemplates();
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmailTemplateFormData>({
    name: '',
    subject: '',
    body: '',
    variables: [],
  });
  const [variableInput, setVariableInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateTemplate.mutateAsync({ id: editingId, data: formData });
    } else {
      await createTemplate.mutateAsync(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      variables: [],
    });
    setVariableInput('');
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      variables: template.variables || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const addVariable = () => {
    if (variableInput && !formData.variables.includes(variableInput)) {
      setFormData({ ...formData, variables: [...formData.variables, variableInput] });
      setVariableInput('');
    }
  };

  const removeVariable = (v: string) => {
    setFormData({ ...formData, variables: formData.variables.filter(vr => vr !== v) });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Email Templates</h2>
          <p className="text-muted-foreground">Manage system email templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-brand-gradient hover:opacity-90 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Template' : 'Create Template'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5"
                    placeholder="e.g., welcome_email"
                    required
                  />
                </div>
                <div>
                  <Label>Subject Line</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label>HTML Body</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="mt-1.5 min-h-[200px] font-mono text-sm"
                  required
                />
              </div>

              <div>
                <Label>Variables</Label>
                <div className="flex gap-2 mt-1.5 mb-2">
                  <Input
                    value={variableInput}
                    onChange={(e) => setVariableInput(e.target.value)}
                    placeholder="Add variable (e.g., user_name)"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariable(); } }}
                  />
                  <Button type="button" onClick={addVariable} variant="secondary">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map(v => (
                    <span key={v} className="bg-secondary px-2 py-1 rounded text-sm flex items-center gap-1 border border-border">
                      {v} <button type="button" onClick={() => removeVariable(v)} className="hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand-gradient hover:opacity-90">
                {editingId ? 'Update Template' : 'Create Template'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card key={template.id} className="bg-card border-border hover:border-primary/50 transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium text-foreground truncate pr-2">
                {template.name}
              </CardTitle>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                  <Pencil className="h-4 w-4 text-blue-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 truncate">Subject: {template.subject}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {template.variables?.map(v => (
                  <span key={v} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                    {`{${v}}`}
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Updated {format(new Date(template.updated_at), 'MMM d, yyyy')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmailTemplatesManager;
