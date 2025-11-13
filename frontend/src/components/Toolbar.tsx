import { REMOVE_TOKEN, useUserInfo } from '@/dal/hooks';
import { Button } from '@/components/ui/button';

export const Toolbar = () => {
  const user = useUserInfo();
  const setExit = REMOVE_TOKEN;
  return (
    <div className={'flex justify-between items-center'}>
      <div>Привет: {user?.name}</div>
      <Button onClick={setExit}>Выйти</Button>
    </div>
  );
};
