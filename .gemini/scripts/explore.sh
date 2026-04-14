#!/usr/bin/env bash
# Usage : ./explore.sh [status|branches|prs|issues|releases|log|diff] [args]

CMD=${1:-status}

case "$CMD" in
  status)
    echo "═══ 📊 ÉTAT DU REPO ═══"
    echo "Branche : $(git branch --show-current)"
    echo "Tag     : $(git tag --sort=-version:refname | head -1)"
    echo ""
    git status --short
    echo ""
    gh pr list --state open --limit 5
    echo ""
    gh issue list --state open --limit 5
    ;;
  branches)
    echo "🌿 Local :"; git branch -v
    echo "🌐 Remote :"; git branch -r | grep -v HEAD
    ;;
  prs)
    gh pr list --state all --limit 10 \
      --json number,title,state,headRefName \
      --template '{{range .}}#{{.number}} [{{.state}}] {{.title}} ({{.headRefName}}){{"\n"}}{{end}}'
    ;;
  issues)
    gh issue list --state "${2:-open}" --limit 15 \
      --json number,title,state,labels \
      --template '{{range .}}#{{.number}} {{.title}} {{range .labels}}[{{.name}}] {{end}}{{"\n"}}{{end}}'
    ;;
  releases) gh release list --limit 10 ;;
  log) git log --oneline --graph --decorate -"${2:-15}" ;;
  diff) git diff "${2:-develop}"...HEAD --stat ;;
  *) echo "❌ Commandes : status | branches | prs | issues | releases | log [n] | diff [branche]" ;;
esac
