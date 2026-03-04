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
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/services/store';
import toast from 'react-hot-toast';
import { resetPasswordUser } from '@/services/thunks';

const formSchema = z
  .object({
    email: z.string().email({ message: 'Email address is required.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.auth);

  const [searchParams] = useSearchParams();
  const emailFromQuery = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const tokenFromQuery = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (emailFromQuery) form.setValue('email', emailFromQuery);
  }, [emailFromQuery, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!tokenFromQuery) {
      toast.error('Reset token is missing or invalid');
      return;
    }

    try {
      await dispatch(
        resetPasswordUser({
          email: values.email,
          code: tokenFromQuery,
          password: values.password,
        })
      ).unwrap();

      toast.success('Password reset successful. Please sign in.');
      navigate('/');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to reset password');
    }
  }

  return (
    <div className="bg-[#F2F2F2] min-h-screen flex flex-col items-center justify-center">
      <div className="flex justify-center w-full mb-8">
        <img src="/images/fulllogo.png" className="w-44" />
      </div>

      <div className="bg-white rounded-lg w-[90%] max-w-lg px-14 flex flex-col items-center shadow-sm py-8">
        <h2 className="text-2xl font-medium text-primary text-center mb-8">
          RESET PASSWORD
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="Email"
                      disabled={!!emailFromQuery}
                      className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4"
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
                        id="password"
                        {...field}
                        label="New Password"
                        type={!showPassword ? 'password' : 'text'}
                        placeholder="New password"
                        className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {!showPassword ? (
                          <EyeOpenIcon className="w-5 h-5 text-neutral-900" />
                        ) : (
                          <EyeOffIcon className="w-5 h-5 text-neutral-900" />
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
                        id="confirmPassword"
                        {...field}
                        label="Confirm Password"
                        type={!showConfirmPassword ? 'password' : 'text'}
                        placeholder="Confirm password"
                        className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {!showConfirmPassword ? (
                          <EyeOpenIcon className="w-5 h-5 text-neutral-900" />
                        ) : (
                          <EyeOffIcon className="w-5 h-5 text-neutral-900" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm mt-3">
          <span className="font-medium cursor-pointer text-xs" onClick={() => navigate('/')}
            >Back to sign in</span
          >
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
