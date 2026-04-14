# 🚀 Gemini Quick Reference

## Essential Commands

### Check Project Health

```bash
.gemini/scripts/init.sh              # 🚀 First time setup
.gemini/scripts/health-check.sh      # 🏥 Diagnostic
.gemini/scripts/stats.sh --detailed  # 📊 Full stats
```

### Code Quality

```bash
.gemini/scripts/lint.sh --fix        # 🔍 Lint + Fix
.gemini/scripts/format.sh            # 💅 Format
.gemini/scripts/test.sh              # ✅ Tests
.gemini/scripts/audit.sh --fix       # 🎯 Audit
```

### Invoke Agents

```bash
.gemini/scripts/invoke.sh coder "..."        # 💻 Code something
.gemini/scripts/invoke.sh frontend "..."     # 🎨 Frontend
.gemini/scripts/invoke.sh api "..."          # 🔌 API
.gemini/scripts/invoke.sh security "..."     # 🔒 Security
.gemini/scripts/invoke.sh testing "..."      # ✅ Tests
```

### Feature Development

```bash
.gemini/scripts/new-feature.sh               # Plan feature
.gemini/scripts/issue.sh feature "Name" --start  # Create + branch
.gemini/scripts/pr.sh                        # Create PR
```

### Deployment

```bash
.gemini/scripts/deploy.sh staging   # Staging
.gemini/scripts/deploy.sh prod      # Production
.gemini/scripts/quick-fix.sh        # Hotfix
```

---

## 📋 Agent List (16)

**Core**: orchestrator, architect, coder, reviewer
**Frontend/Mobile**: frontend, mobile
**Backend**: api, database, performance
**Quality**: testing, security, ci-cd, qa, devops
**Docs**: documenter, github

---

## 📊 Script Categories

| Category    | Scripts                                  |
| ----------- | ---------------------------------------- |
| Setup       | init.sh                                  |
| Health      | health-check.sh, stats.sh, logs.sh       |
| Quality     | lint.sh, format.sh, test.sh, audit.sh    |
| Performance | benchmark.sh, invoke.sh performance      |
| Git         | branch.sh, pr.sh, issue.sh, quick-fix.sh |
| Release     | release.sh, tag.sh                       |
| Deploy      | deploy.sh                                |
| Database    | migrate.sh                               |
| Maintenance | sync-all.sh, security-scan.sh            |

---

## 🔥 Top Workflows

### 1️⃣ Quick Quality Check

```bash
.gemini/scripts/lint.sh --fix
.gemini/scripts/test.sh --watch
.gemini/scripts/audit.sh --fix
```

### 2️⃣ Complete Feature Flow

```bash
.gemini/scripts/issue.sh feature "X" --start
# ... code changes ...
.gemini/scripts/lint.sh --fix
.gemini/scripts/test.sh
.gemini/scripts/audit.sh --fix
.gemini/scripts/pr.sh
```

### 3️⃣ Urgent Hotfix

```bash
.gemini/scripts/quick-fix.sh
# ... changes ...
.gemini/scripts/quick-fix.sh --commit
```

### 4️⃣ Before Production Deploy

```bash
.gemini/scripts/health-check.sh
.gemini/scripts/lint.sh --fix
.gemini/scripts/test.sh coverage
.gemini/scripts/audit.sh --fix
.gemini/scripts/security-scan.sh
.gemini/scripts/benchmark.sh api
.gemini/scripts/deploy.sh staging
# ... verify ...
.gemini/scripts/deploy.sh prod
```

---

## 💡 Pro Tips

1. **Generate ARCHITECTURE.md** - Agents use it automatically

   ```bash
   .gemini/scripts/invoke.sh architect "..."
   # → Save to ARCHITECTURE.md
   ```

2. **Run tests in watch mode** - Auto-rerun on changes

   ```bash
   .gemini/scripts/test.sh --watch
   ```

3. **Parallel agents** - Speed up tasks

   ```bash
   .gemini/scripts/invoke.sh frontend "..." &
   .gemini/scripts/invoke.sh api "..." &
   wait
   ```

4. **Follow logs** - Real-time debugging

   ```bash
   .gemini/scripts/logs.sh backend --follow
   ```

5. **Benchmark before/after** - Measure improvements
   ```bash
   .gemini/scripts/benchmark.sh api
   # ... make changes ...
   .gemini/scripts/benchmark.sh api
   ```

---

## ⚠️ Common Issues

| Issue             | Solution                          |
| ----------------- | --------------------------------- |
| Script not found  | `chmod +x .gemini/scripts/*.sh`   |
| Agent not found   | Check `.gemini/skills/` directory |
| Permissions error | Run `git config user.email "..."` |
| Cache stale       | `rm -rf .gemini/.cache`           |

---

## 📚 Full Docs

- `README.md` - Complete guide
- `AGENTS.md` - All agents & scripts detail
- `CHANGELOG_v4.1.md` - Latest changes
- `.gemini/skills/*/SKILL.md` - Agent documentation

---

**v4.1** - 16 Agents × 24 Scripts = 💪 Professional Development
