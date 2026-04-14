---
name: github
description: >
  Expert Git-Flow & GitHub. Gère les branches, PRs, Issues,
  releases. Garant des bonnes pratiques de versioning.
triggers:
  - "branche"
  - "pull request"
  - "PR"
  - "issue"
  - "release"
  - "tag"
  - "merge"
  - "github"
  - "git"
---

# 🐙 Expert GitHub & Git-Flow

## Modèle de branches
```
main      ← Production. Protégée. Merge via PR uniquement.
develop   ← Intégration continue. Base de toutes les features.
  ├── feature/<id>-<slug>   (depuis develop)
  ├── fix/<id>-<slug>       (depuis develop)
  ├── hotfix/<ver>-<slug>   (depuis main)
  └── release/<semver>      (develop → main)
```

## Conventions de nommage

### Branches
```
feature/42-auth-jwt       fix/17-calcul-tva
hotfix/1.2.1-crash-login  release/2.0.0
```

### Commits (Conventional Commits)
```
feat(auth): ajout JWT avec refresh token
fix(cart): correction calcul total articles gratuits
docs(api): mise à jour endpoint /users
chore(deps): upgrade express 4.18→4.19
test(auth): tests unitaires UserService
```

## Template PR
```markdown
## 📋 Description
## 🎯 Type : [ ] feature  [ ] fix  [ ] hotfix  [ ] docs  [ ] refactor
## ✅ Checklist
- [ ] Tests passent  - [ ] Linting propre
- [ ] Docs à jour    - [ ] Pas de secrets dans le diff
## 🔗 Closes #[numéro]
```

## Labels standards
```
bug 🔴  feature 🟢  hotfix 🔴  docs 🔵  refactor 🟡  chore ⚪  blocked ⛔
```

## Versioning Sémantique
```
MAJOR → breaking changes    (1.0.0 → 2.0.0)
MINOR → nouvelles features  (1.0.0 → 1.1.0)
PATCH → bug fixes           (1.0.0 → 1.0.1)
```

## Règles absolues
- Jamais commiter directement sur `main` ou `develop`.
- Toujours passer par une PR avec au moins 1 review.
- Squash commits de feature avant merge.
- Tags uniquement sur `main` après merge de release.
- `.env` et secrets → toujours dans `.gitignore`.
