#!/bin/sh
input=$(cat)
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')
folder=$(basename "$cwd")
branch=$(git -C "$cwd" --no-optional-locks rev-parse --abbrev-ref HEAD 2>/dev/null)
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

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

# 4. Session cost (if available and > 0)
cost=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')
if [ -n "$cost" ]; then
  cost_check=$(echo "$cost" | awk '{print ($1 > 0) ? "yes" : "no"}')
  if [ "$cost_check" = "yes" ]; then
    cost_fmt=$(printf "%.2f" "$cost")
    parts=$(printf "%s  💰 \$%s" "$parts" "$cost_fmt")
  fi
fi

# 5. Context bar calibrated to auto-compact threshold (80% used)
# Bar fills as context is consumed; colors: green <40%, yellow 40-63%, red >=64%
if [ -n "$used" ]; then
  used_int=$(printf "%.0f" "$used")
  filled=$(awk "BEGIN {v=int(($used_int/80.0)*10+0.5); if(v>10) v=10; print v}")
  empty=$(( 10 - filled ))
  bar=""
  i=0
  while [ "$i" -lt "$filled" ]; do bar="${bar}▓"; i=$(( i + 1 )); done
  i=0
  while [ "$i" -lt "$empty" ]; do bar="${bar}░"; i=$(( i + 1 )); done
  if [ "$used_int" -lt 40 ]; then
    ctx_color="\033[32m"
  elif [ "$used_int" -lt 64 ]; then
    ctx_color="\033[33m"
  else
    ctx_color="\033[31m"
  fi
  parts=$(printf "%s  %b%s %s%%\033[0m" "$parts" "$ctx_color" "$bar" "$used_int")
fi

printf "%s" "$parts"
