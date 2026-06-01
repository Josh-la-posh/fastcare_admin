import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layout/auth-layout';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { requestPasswordResetCode } from '@/services/thunks';
import toast from 'react-hot-toast';
import { ROUTES } from '@/router/routes';
import React from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Email address is required.' }),
});

const ForgetPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isSubmiting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      await dispatch(requestPasswordResetCode({ email: values.email })).unwrap();
      toast.success('Reset code sent successfully.');
      setIsSubmitting(false);
      navigate(`${ROUTES.reset}?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(String(error || 'Failed to request password reset code'));
    }
  }

  return (
    <AuthLayout>
      <div className="px-14 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-medium">Forgot password</h2>
          <p className="text-md text-gray-600 mt-2">
            Enter your email to receive a reset code.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-8"
          >
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
                      className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4 h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type={isSubmiting ? "button" : "submit"} className="w-full mt-2 py-3">
              {isSubmiting ? 'Sending...' : 'Send reset code'}
            </Button>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
};

export default ForgetPassword;
