import { Apple, Smartphone } from "lucide-react";
import { useAppCta } from "./AppCtaContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// No App Store / Play Store listing or APK exists yet — this is intentionally
// honest rather than linking to a store page or file that isn't published.
// Once builds ship (EAS build + App Store Connect / Play Console), swap the
// placeholders below for real store links.
export function DownloadAppDialog() {
  const { downloadOpen, setDownloadOpen } = useAppCta();

  return (
    <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
      <DialogContent className="bg-surface sm:max-w-md sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle>Varlet isn't published yet</DialogTitle>
          <DialogDescription>
            We're not on the App Store or Google Play yet, so there's no real download link to give
            you here — and we won't fake one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 opacity-60">
            <Apple className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-foreground">App Store</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 opacity-60">
            <Smartphone className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-foreground">Google Play</p>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Registering your store still works right now — you'll get an email/password login to use
          once the app is available.
        </p>
      </DialogContent>
    </Dialog>
  );
}
