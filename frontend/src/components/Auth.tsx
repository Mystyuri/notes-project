'use client';

import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLoginMutation, useRegistrationMutation } from '@/dal/hooks';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { withAuth } from '@/hoc/withAuth';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(2),
});

const registrationSchema = loginSchema.extend({
  name: z.string(),
});

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { mutate: login } = useLoginMutation();
  const { mutate: register } = useRegistrationMutation();

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });
  const onSubmit = form.handleSubmit((data) => {
    const { password, email, name } = data;
    if (isLogin) {
      login({ password, email });
    } else {
      if (name) {
        register({ password, email, name });
      }
    }
  });
  return (
    <Card className="w-full max-w-sm my-auto">
      <CardHeader>
        <CardTitle>{isLogin ? 'Войти в ваш аккаунт' : 'Зарегистрироваться'}</CardTitle>
        <CardAction>
          <Button variant={'link'} onClick={() => setIsLogin((state) => !state)}>
            {isLogin ? 'Регистрация' : 'Вход'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form id={'form-auth'} onSubmit={onSubmit} className="space-y-8">
          {!isLogin && (
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Имя</FieldLabel>
                  <Input type="text" {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Почта</FieldLabel>
                <Input type="email" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Пароль</FieldLabel>
                <Input type="password" {...field} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="form-auth" className="w-full">
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default withAuth(Auth);
