import { useTranslation } from "react-i18next"
import { getAppVersion, getFormattedVersion } from "@/lib/app-version"
import { openExternalUrl, createExternalLinkHandler } from "@/lib/external-link"
import { ExternalLink, Info } from "lucide-react"

interface PanelProps {
  searchQuery?: string
}

// Core maintainers and contributors
const CONTRIBUTORS = [
  { 
    name: "danielchim", 
    role: "Core Maintainer",
    url: "https://github.com/danielchim"
  },
  { 
    name: "AkaraChen", 
    role: "Core Maintainer",
    url: "https://github.com/akarachen"
  },
]

const LICENSES = [
  { name: "MIT License", url: "https://github.com/danielchim/r2modmanplusplus/blob/master/LICENSE" },
]

export function AboutPanel(_props: PanelProps) {
  void _props
  const { t } = useTranslation()
  const versionInfo = getAppVersion()
  const formattedVersion = getFormattedVersion()
  const appName = "r2modman++"

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t("settings_about_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings_about_description")}
        </p>
      </div>

      {/* App Info Card - iOS Style */}
      <div className="mb-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          {/* App Name & Version */}
          <div className="px-6 py-10 text-center border-b border-border/50">
            <h3 className="text-2xl font-semibold mb-2">{appName}</h3>
            <p className="text-sm text-muted-foreground mb-3">{formattedVersion}</p>
            {versionInfo.mode === "UAT" && (
              <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20">
                {t("settings_about_uat_badge")}
              </span>
            )}
          </div>

          {/* Version Details */}
          {versionInfo.buildInfo && (
            <div className="divide-y divide-border/50">
              <div className="flex justify-between items-center px-6 py-3.5">
                <span className="text-sm text-muted-foreground">{t("settings_about_build_number")}</span>
                <span className="text-sm font-medium text-foreground">{versionInfo.buildInfo.build}</span>
              </div>
              <div className="flex justify-between items-center px-6 py-3.5">
                <span className="text-sm text-muted-foreground">{t("settings_about_build_time")}</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(versionInfo.buildTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contributors Section */}
      {CONTRIBUTORS.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t("settings_about_contributors")}
          </h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="divide-y divide-border/50">
              {CONTRIBUTORS.map((contributor, index) => {
                const content = (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{contributor.name}</p>
                      {contributor.role && (
                        <p className="text-xs text-muted-foreground mt-0.5">{contributor.role}</p>
                      )}
                    </div>
                    {contributor.url && (
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                    )}
                  </>
                )

                if (contributor.url) {
                  return (
                    <a
                      key={index}
                      href={contributor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center px-6 py-3.5 hover:bg-muted/50 active:bg-muted transition-colors group cursor-pointer"
                      onClick={createExternalLinkHandler(contributor.url)}
                    >
                      {content}
                    </a>
                  )
                }

                return (
                  <div key={index} className="px-6 py-3.5">
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Open Source Notice */}
      <div className="mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              {t("settings_about_opensource_title")}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t("settings_about_opensource_description")}
            </p>
          </div>
        </div>
      </div>

      {/* Licenses Section */}
      {LICENSES.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {t("settings_about_licenses")}
          </h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="divide-y divide-border/50">
              {LICENSES.map((license, index) => (
                <a
                  key={index}
                  href={license.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-between items-center px-6 py-3.5 hover:bg-muted/50 active:bg-muted transition-colors group cursor-pointer"
                  onClick={createExternalLinkHandler(license.url)}
                >
                  <span className="text-sm font-medium text-foreground">{license.name}</span>
                  <ExternalLink className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="text-center text-xs text-muted-foreground">
        <p>{t("settings_about_copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </div>
  )
}
