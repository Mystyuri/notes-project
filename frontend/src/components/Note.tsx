import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenLine, Trash2 } from 'lucide-react';
import { useCreateNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from '@/dal/hooks';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Note(props: { title: string | null; content: string; id_note: string }) {
  const { content, title, id_note } = props;
  const [isEdit, setIsEdit] = useState(false);
  const deleteNote = useDeleteNoteMutation();
  const setDeleteNote = () => deleteNote.mutate({ id_note });
  const setEdit = () => setIsEdit((state) => !state);

  if (isEdit) {
    return <CreateNote content={content} title={title ?? ''} id_note={id_note} onCancel={setEdit} />;
  }

  return (
    <Card className="w-full relative">
      <CardAction className={'absolute right-1 top-1'}>
        <Button size="icon-sm" variant={'link'} onClick={setEdit}>
          <PenLine />
        </Button>{' '}
        <Button size="icon-sm" variant={'link'} onClick={setDeleteNote}>
          <Trash2 />
        </Button>
      </CardAction>
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{content}</CardDescription>
      </CardContent>
    </Card>
  );
}

const CreateNoteScheme = z.object({
  title: z.string(),
  content: z.string().min(2),
});

export const CreateNote = (
  props: Partial<z.infer<typeof CreateNoteScheme> & { id_note: string; onCancel: () => void }>,
) => {
  const isEdit = !!props.id_note;

  const form = useForm({
    resolver: zodResolver(CreateNoteScheme),
    defaultValues: {
      title: '',
      content: '',
      ...props,
    },
  });
  const updateNote = useUpdateNoteMutation();
  const createNote = useCreateNoteMutation();
  const onSubmit = form.handleSubmit((data) => {
    const title = data.title.length > 1 ? data.title : null;
    const content = data.content;
    props?.id_note
      ? updateNote.mutate({ title, content, id_note: props.id_note })
      : createNote.mutate({ title, content });
    form.reset({
      title: '',
      content: '',
    });
    props.onCancel?.();
  });
  const formId = props.id_note ?? 'form-note';
  return (
    <Card>
      <CardContent>
        <form id={formId} onSubmit={onSubmit}>
          <FieldSet>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input autoComplete="off" type="text" placeholder={'Заголовок'} {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input autoComplete="off" type="text" placeholder={'Заметка'} {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldSet>
        </form>
      </CardContent>
      <CardFooter className={'space-x-2'}>
        <Button type={'submit'} form={formId}>
          {isEdit ? 'Редактировать' : 'Добавить'}
        </Button>
        {isEdit && (
          <Button variant={'secondary'} type={'button'} onClick={props.onCancel}>
            Отменить
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
