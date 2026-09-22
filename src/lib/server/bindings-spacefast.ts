// No database or salt is provisioned on the Spacefast target.
export function bindings(_locals: App.Locals, _request: Request): never {
  throw new Error('Spacefast has no direct database binding');
}
