
import { z } from "zod";

// create user validation schema
const userValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    phoneNumber: z.string({
      required_error: "Phone number is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format"),
    password: z.string({
      required_error: "Password is required",
    }).min(4, "Password must be at least 4 characters long")
      .max(20, "Password must not exceed 20 characters"),
  })
});

// update user validation schema
const userValidationLoginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required'
    }),
    password: z.string({
      required_error: 'Password is required'
    })
  })
})
const changesPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string({
      required_error: 'New password is required'
    }),
    oldPassword: z.string({
      required_error: 'Old password is required'
    })
  })
})


// refresh token validation schema
const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});
const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email id is required!',
    }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required!',
    }),
    newPassword: z.string({
      required_error: 'User password is required!',
    }),
  }),
});
const verifyEmailValidationSchema = z.object({
  body: z.object({
    id: z.string({
      required_error: 'User id is required!',
    })
  }),
});

export const userValidation = {
  userValidationSchema,
  userValidationLoginSchema,
  refreshTokenValidationSchema,
  changesPasswordSchema,
  resetPasswordValidationSchema,
  forgetPasswordValidationSchema,
  verifyEmailValidationSchema
};
