'use client';

import { withAuth } from '@/hoc/withAuth';
import { useGetNotesQuery } from '@/dal/hooks';
import { Preloader } from '@/components/Preloader';
import { CreateNote, Note } from '@/components/Note';
import { Toolbar } from '@/components/Toolbar';

const Main = () => {
  const notes = useGetNotesQuery();
  if (notes.isPending) return <Preloader />;
  return (
    <div className={'grid w-lg gap-2 h-fit'}>
      <Toolbar />
      <CreateNote />
      {(notes.data ?? []).map((note) => (
        <Note key={note.id_note} id_note={note.id_note} title={note.title} content={note.content} />
      ))}
    </div>
  );
};

export default withAuth(Main);
