import { Button } from "@/components/ui/button";
import { logoutAction } from "@/modules/auth/actions";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary" className="px-4 py-2 text-xs">
        Выйти
      </Button>
    </form>
  );
}
