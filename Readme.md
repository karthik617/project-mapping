# VS Quick Open

⚡ Quick VS Code launcher with project aliases from terminal

## Installation
```bash
npm install -g @karthik_yk/vs-quick-open
```

## Usage

### Open files/folders directly
```bash
vs .                    # Open current directory
vs ~/projects/myapp     # Open specific path
vs file1.js file2.js    # Open multiple files
```

### Manage aliases
```bash
# Add alias
vs add myproject ~/Documents/my-project
vs add dotfiles ~/.config

# List all aliases
vs list

# Remove alias
vs remove myproject
```

### Use aliases
```bash
vs myproject           # Opens ~/Documents/my-project
vs dotfiles            # Opens ~/.config
```

## Features

- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ Project aliases for quick access
- ✅ Open multiple files/folders at once
- ✅ Home directory expansion (~)
- ✅ Path validation with warnings

## Commands

| Command | Description |
|---------|-------------|
| `vs <path...>` | Open file(s)/folder(s) in VS Code |
| `vs add <alias> <path>` | Create an alias |
| `vs remove <alias>` | Remove an alias |
| `vs list` | Show all aliases |

## License

MIT