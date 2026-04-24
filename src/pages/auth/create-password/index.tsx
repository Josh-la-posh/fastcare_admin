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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layout/auth-layout';

const formSchema = z.object({
  email: z.string().email({ message: 'Email address is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  remember: z.boolean().optional(),
});

const CreatePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      email: values.email,
      password: values.password,
      remember: values.remember,
    };

    navigate('/home');
    console.log('Form submitted with values:', payload);
  }

  return (
    <AuthLayout>
      {/* White card */}
      <div className="px-14 flex flex-col">
        {/* {user ? <p>Welcome {user.name}</p> : <p>Please log in</p>} */}
        <div className="mb-6">
          <h2 className="text-xl font-medium">Log in</h2>
          <p className="text-md text-gray-600 mt-2">
            Enter your details to proceed.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-8"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="Email"
                      className="w-full border-[#b6c2cc] bg-gray-50 rounded-lg px-3 py-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                           id="password"
                          {...field}
                           label="Password"
                          type={!showPassword ? 'password' : 'text'}
                          placeholder="Password"
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

              {/* Remember Me */}
              <div className="flex items-center justify-between text-md mt-4">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({field}) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          className="w-5 h-5 mt-2"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label className="text-gray-900 ">Remember me</label>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-4">
              Log in
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm mt-3">
          <p>
            <span
              className="font-medium cursor-pointer text-[16px]"
              onClick={() => navigate('/auth/create-account')}
            >
              Forgot your password?
            </span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CreatePassword;
