#!/bin/sh
input=$(cat)
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')
folder=$(basename "$cwd")
branch=$(git -C "$cwd" --no-optional-locks rev-parse --abbrev-ref HEAD 2>/dev/null)
remaining=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty')

parts=""

# 1. Folder name in blue
parts=$(printf "\033[34m📁 %s\033[0m" "$folder")

# 2. Git branch in green (if available)
if [ -n "$branch" ]; then
  parts=$(printf "%s  \033[32m🌿 %s\033[0m" "$parts" "$branch")
fi

# 3. Model display name (full, if available)
model_name=$(echo "$input" | jq -r '.model.display_name // empty')
if [ -n "$model_name" ]; then
  parts=$(printf "%s  \033[35m🤖 %s\033[0m" "$parts" "$model_name")
fi

# 4. Context remaining percentage as progress bar (if available)
if [ -n "$remaining" ]; then
  remaining_int=$(printf "%.0f" "$remaining")
  used_int=$(( 100 - remaining_int ))
  filled=$(( (used_int + 5) / 10 ))
  [ "$filled" -gt 10 ] && filled=10
  empty=$(( 10 - filled ))
  bar=""
  i=0
  while [ "$i" -lt "$filled" ]; do bar="${bar}▓"; i=$(( i + 1 )); done
  i=0
  while [ "$i" -lt "$empty" ]; do bar="${bar}░"; i=$(( i + 1 )); done
  if [ "$remaining_int" -gt 60 ]; then
    ctx_color="\033[32m"
  elif [ "$remaining_int" -ge 30 ]; then
    ctx_color="\033[33m"
  else
    ctx_color="\033[31m"
  fi
  parts=$(printf "%s  %b%s %s%%\033[0m" "$parts" "$ctx_color" "$bar" "$remaining_int")
fi

printf "%s" "$parts"
