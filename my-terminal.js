figlet.defaults({ fontPath: "https://unpkg.com/figlet/fonts/" });
figlet.preloadFonts(["Standard", "Slant"], ready);

var term;

const formatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

const user = "guest";
const server = "linux.org";
const root = "~";
let cwd = root;

const directories = {
  education: [
    "",
    "<white>education</white>",

    '* Estudando <a href="https://pt.wikipedia.org/wiki/Universidade_Cesumar">Unicesumar</a> <yellow>"Computer Science"</yellow> 2023-2024 / 2024-2025',
    //    '* <a href="https://pl.wikipedia.org/wiki/Szko%C5%82a_policealna">Post-secondary</a> Electronic School <yellow>"Computer Systems"</yellow> 2000-2002',
    //    '* Electronic <a href="https://en.wikipedia.org/wiki/Technikum_(Polish_education)">Technikum</a> with major <yellow>"RTV"</yellow> 1995-2000',
    "",
  ],
  projects: [
    "",
    "<white>Open Source projects</white>",
    [
      [
        "GhostBSD",
        "https://ghostbsd.org/",
        "A simple, elegant desktop BSD Operating System",
      ],
      [
        "Crystal Lang",
        "https://crystal-lang.org/",
        "A language for humans and computers ",
      ],
      // ["Sysend.js", "https://jcu.bi/sysend", "Communication between open tabs"],
      //  ["Wayne", "https://jcu.bi/wayne", "Pure in browser HTTP requests"],
    ].map(([name, url, description = ""]) => {
      return `* <a href="${url}">${name}</a> &mdash; <white>${description}</white>`;
    }),
    "",
  ].flat(),
  skills: [
    "",
    "<white>languages</white>",

    ["Java", "GO", "C", "RUBY", "*sh"].map(
      (lang) => `* <yellow>${lang}</yellow>`,
    ),
    "",
    "<white>libraries</white>",
    ["Rails", "SpringBoot", "NodeJS"].map((lib) => `* <green>${lib}</green>`),
    "",
    "<white>tools</white>",
    ["Jails", "Bhyve", "FreeBSD", "Docker", "git", "GNU/Linux", "Aix/IBM"].map(
      (lib) => `* <blue>${lib}</blue>`,
    ),
    "",
  ].flat(),
};
//end
function print_dirs() {
  const dirs = ["education", "projects", "skills"];
  term.echo(
    dirs
      .map((dir) => {
        return `<blue class="directory">${dir}</blue>`;
      })
      .join("\n"),
  );
}

function prompt() {
  return `<green>${user}@${server}</green>:<blue>${cwd}</blue>$ `;
}
const commands = {
  ls(dir = null) {
    if (dir) {
      if (dir.startsWith("~/")) {
        const path = dir.substring(2);
        const dirs = path.split("/");
        if (dirs.length > 1) {
          this.error("Invalid directory");
        } else {
          const dir = dirs[0];
          this.echo(directories[dir].join("\n"));
        }
      } else if (cwd === root) {
        if (dir in directories) {
          this.echo(directories[dir].join("\n"));
        } else {
          this.error("Invalid directory");
        }
      } else if (dir === "..") {
        print_dirs();
      } else {
        this.error("Invalid directory");
      }
    } else if (cwd === root) {
      print_dirs();
    } else {
      const dir = cwd.substring(2);
      this.echo(directories[dir].join("\n"));
    }
  },
  echo(...args) {
    if (args.length > 0) {
      term.echo(args.join(" "));
    }
  },
  help() {
    term.echo(`List of available commands: ${help}`);
    term.on("click", ".command", function () {
      const command = $(this).text();
      term.exec(command);
    });
  },
  cd(dir = null) {
    // Verifica se dir é null ou se é ".." e cwd não é a raiz
    if (dir === null || (dir === ".." && cwd !== root)) {
      cwd = root;
    } else {
      // Verifica se dir está presente na lista de diretórios
      switch (dir) {
        case "education":
        case "projects":
        case "skills":
          cwd = root + "/" + dir;
          break;
        default:
          this.error("Directory not found!");
          return;
      }
    }
  },
};

const command_list = Object.keys(commands);
const formatted_list = command_list.map((cmd) => {
  return `<white class="command">${cmd}</white>`;
});
const help = formatter.format(formatted_list);

function ready() {
  term = $("body").terminal(
    commands,
    //function (commands) {
    // echo function will run it in each render,
    // so text can be resized based on cols
    // this.echo(() => render(this, commands));
    // },
    {
      greetings: false,
      checkArity: false,
      completion(string) {
        // in every function we can use `this` to reference term object
        const cmd = this.get_command();
        // we process the command to extract the command name
        // at the rest of the command (the arguments as one string)
        const dirs = ["education", "projects", "skills"];
        const { name, rest } = $.terminal.parse_command(cmd);
        if (["cd", "ls"].includes(name)) {
          if (rest.startsWith("~/")) {
            return dirs.map((dir) => `~/${dir}`);
          }
          if (cwd === root) {
            return dirs;
          }
        }
        return Object.keys(commands);
      },
      prompt,
      onInit() {
        this.echo(
          () =>
            render(this, "Terminal Blog", "Slant") +
            `\n[[;rgba(255,255,255,0.99);]jQuery Terminal ${$.terminal.version}]. Bem-vindo sysadmin and developers.\n`,
        );
      },
    },
  );
}

function render(term, text, font) {
  const cols = term.cols();
  return figlet.textSync(text, {
    font: font || "Standard",
    width: cols,
    whitespaceBreak: true,
  });
}
