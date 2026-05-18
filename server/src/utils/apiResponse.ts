export const ok = <T>(message: string, data: T) => ({
  success: true,
  message,
  data,
});

export const created = <T>(message: string, data: T) => ({
  success: true,
  message,
  data,
});
