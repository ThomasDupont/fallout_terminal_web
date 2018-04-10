import { Component, OnInit } from '@angular/core';
import {daily} from './Daily';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private interval = 50;

    public first = '';
    public header = 'Welcome to SHADOW Industries (TM) Termlink\n\r PAM Mainframe Interface \n\r    ===================================';
    public needPass = true;
    public back = false;
    public selection = false;
    public prompt: any;

    constructor() {

    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.prompt = document.getElementById('prompt');
        this.promptVisibility = false;
        document.getElementById('selection').style.visibility = 'hidden';
        this.print('Welcome to SHADOW Industries (TM) Termlink;;Password Required;;=;Password:§', this.interval);
    }

    async print (text: string, interval: number = 100) {
        this.promptVisibility = false;
        for (let i = 0; i < text.length ; i++) {
            await this.timeout(interval);
            const e = text[i];
            if (e === ';') {
                this.first += '\n\r';
            } else if (e === '=') {
                this.first += '   ===================================';
            } else if (e === '§') {
                this.promptVisibility = true;
                this.prompt.focus();
            } else {
                this.first += e;
            }
        }
        this.promptVisibility = true;
    }

    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    set promptVisibility(vis: boolean) {
        this.prompt.style.visibility = vis ? 'visible' : 'hidden';
    }

    async onKey(event: any) {
        const value = event.target.value;
        if (event.keyCode === 13) {
            if (this.needPass) {
                await this.checkPassword(event.target);
                return null;
            } else {
                if (value === 'y') {
                    if (this.back) {
                        event.target.value = '';
                        this.backAction();
                    }
                    return null;
                } else if (value === 'n') {
                    event.target.value = '';
                    return null;
                }

                if (value.match(/run:\/\//)) {
                    this.doCommand(event);
                    return;
                }
                this.print(' ' + value + ';Unknow command ' + value + ';tipe : run://<command>;>§', this.interval);
                event.target.value = '';
                return null;
            }
        }
        return null;
    }

    async checkPassword(target: any) {
        if (target.value === 'initial') {
            target.value = '';
            this.needPass = false;
            this.first = 'Welcome to SHADOW Industries (TM) Termlink';
            await this.print(';PAM Mainframe Interface;=;;Access OK;;Good morning Thomas', this.interval);
            this.promptVisibility = false;
            document.getElementById('selection').style.visibility = 'visible';
            document.getElementById('daily').focus();
        } else {
            target.value = '';
            this.print(';Password Invalid;;Try again:§', this.interval);
        }
    }

    action (event: any): null {
        if (event.target.id === '') {
            return null;
        }
        document.getElementById('selection').style.visibility = 'hidden';
        this[event.target.id]();
        return null;
    }

    daily () {
        this.first = this.header;
        this.print(';;DAILY SALE;;' + daily.yesterday + ';;return? (y/n)§', this.interval);
        this.back = true;
    }

    command () {
        this.first = this.header;
        this.print(';;>§', this.interval);
    }

    async exit () {
        this.first = '';
        await this.print(';;BYE;', 200);
        window.location.reload();
    }

    backAction() {
        this.promptVisibility = false;
        this.first = this.header;
        this.print(';;', this.interval);
        document.getElementById('selection').style.visibility = 'visible';
        document.getElementById('daily').focus();
    }

    async doCommand(event: any) {
        await this.print(' ' + event.target.value, this.interval);
        const args = event.target.value.split('run://').pop().split(' ');
        event.target.value = '';
        const cmd = args.shift();

        const list = {
            list: function (context: any, args: [string], help: boolean = false) {
                if (help) {
                    context.print(';List all commands;>§', context.interval);
                    return;
                }
                context.print(';' + Object.keys(list).join(';') + ';>§', context.interval);
            },
            back: function (context: any, args: [string], help: boolean = false) {
                if (help) {
                    context.print(';Go back to the selection interface;>§', context.interval);
                    return;
                }
                context.backAction();
            },
            exit: function (context: any, args: [string], help: boolean = false) {
                if (help) {
                    context.print(';Quit the session;>§', context.interval);
                    return;
                }
                context.exit();
            },
            echo: function (context: any, args: [string], help: boolean = false) {
                if (help) {
                    context.print(';argument: string , print something;>§', context.interval);
                    return;
                }
                context.print(';' + args.toString() + ';>§', context.interval);
            },
            help: function (context: any, args: [string], help: boolean = false) {
                if (help) {
                    context.print(';The help command;>§', context.interval);
                    return;
                }
                const command = args.shift();

                if (command !== undefined) {
                    this[command](context, [], true);
                    return;
                }
                context.print(';Commands interface;All of the command is starting by \'run://\';>§', context.interval);
            },
            daily: function (context: any, args: [string], help: boolean = false) {
                if (help) {
                    context.print(';argument: date;Date format DD/MM/YYYY;>§', context.interval);
                    return;
                }
                const arg = args.shift();
                if (arg === undefined) {
                    context.print(';' + daily.yesterday + ';>§');
                    return;
                }

                const find = Object.keys(daily).find(e => arg === e);

                if (find === undefined) {
                    context.print(';NETWORK ERROR;Please contact the system administrator;>§', context.interval);
                    return;
                }

                context.print(';' + daily[find] + ';>§');
                return;
            }
        };

        if (Object.keys(list).find(e => cmd === e) === undefined) {
            this.print(';Unknow command ' + cmd + ';>§', this.interval);
            return;
        }
        list[cmd](this, args);
    }
}
