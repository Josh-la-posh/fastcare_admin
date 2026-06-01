import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EyeOffIcon, EyeOpenIcon } from '@/components/ui/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/layout/auth-layout';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { resetPasswordUser } from '@/services/thunks';
import toast from 'react-hot-toast';
import { ROUTES } from '@/router/routes';

const formSchema = z
  .object({
    code: z.string().min(1, { message: 'OTP is required.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(1, { message: 'Confirm password is required.' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const CreatePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isSubmiting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email) {
      toast.error('Missing email. Please restart the reset process.');
      navigate(ROUTES.forgot);
      return;
    }

    try {
      setIsSubmitting(true);
      await dispatch(
        resetPasswordUser({
          email,
          code: values.code,
          password: values.password,
        })
      ).unwrap();
      toast.success('Password reset successful.');
      setIsSubmitting(false);
      navigate(ROUTES.signin);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(String(error || 'Password reset failed'));
    }
  }

  return (
    <AuthLayout>
      <div className="px-14 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-medium">Reset password</h2>
          <p className="text-md text-gray-600 mt-2">
            Enter the OTP sent to your email and your new password.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      id="code"
                      label="OTP"
                      type="text"
                      placeholder="Enter OTP code"
                      className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4 h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        label="New password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4 h-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5 text-neutral-900" />
                        ) : (
                          <EyeOpenIcon className="w-5 h-5 text-neutral-900" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        id="confirmPassword"
                        label="Confirm password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4 h-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="w-5 h-5 text-neutral-900" />
                        ) : (
                          <EyeOpenIcon className="w-5 h-5 text-neutral-900" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type={isSubmiting ? "button" : "submit"} className="w-full mt-2 py-3">
              {isSubmiting ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
};

export default CreatePassword;
