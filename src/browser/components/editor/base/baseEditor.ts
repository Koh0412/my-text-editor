import * as fs from "fs-extra";
import * as pathModule from "path";

import * as ace from "brace";
import "../../../config/editorconfig";

import Tab from "../../tab";
import FileIO from "../../../api/fileIO";
import CallDialog from "../../../api/callDialog";

import Util from "../../../../common/util";
import Events from "../../../../common/events";
import { EditorMessage } from "../../../../common/constants/messageConstants";
import { aceDefault, acePrefix } from "../../../../common/constants/editorConstants";
import { IAceConf } from "../../../../common/definition/IAceConf";

/** エディタエリア */
export class BaseEditor {
  protected textarea: ace.Editor = ace.edit("textarea");
  private noFileMsg: HTMLElement = Util.getElement("no-file-msg");

  private filePath: string = "";

  private aceConf: IAceConf = {
    theme: aceDefault.THEME,
    mode: aceDefault.MODE,
    showPrintMargin: false,
    tabSize: 2,
    wrap: true,
    indentedSoftWrap: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
  };

  constructor() {
    this.textarea.$blockScrolling = Infinity;
    this.textarea.setOptions(this.aceConf);
    this.init();
  }

  /** エディタ内のvalueを取得 */
  private get value(): string {
    return this.textarea.getValue();
  }

   /** 初期化処理 */
  public init(): void {
    FileIO.setPath("");
    this.setValue("");
    this.noFileMsg.innerHTML = EditorMessage.NO_FILE;

    this.textarea.container.hidden = true;
    Util.removeClass(this.noFileMsg, "hide");

    this.resize();
  }

  /**
   * `path`からタブを生成し、エディタとステータスに`path`のデータを流し込み
   * @param path
   */
  public openfile(path: string): void {
    const name = pathModule.basename(path);
    const stats = fs.statSync(path);
    const icon = Util.createMenuIcon(stats.isDirectory());

    Tab.create(icon.outerHTML + name, path);
    this.updateValue(path);
  }

  /** エディタ内のvalueのセーブ */
  public save(): void {
    this.filePath = FileIO.filePath;

    if (FileIO.isEmptyPath) {
      CallDialog.save((path) => this.filePath = path);
    } else {
      Events.fileEvent("save", this.filePath);
    }

    FileIO.save(this.value, this.filePath);
  }

  /**
   * モードを設定
   * @param mode
   */
  public setMode(mode: string): void {
    this.textarea.session.setMode(acePrefix.MODE + mode);
  }

  /**
   * `path`のファイルのデータをStatusのpathとエディター内に流し込む
   *
   * @param path
   */
  public updateValue(path: string): void {
    FileIO.setPath(path);
    this.textarea.container.hidden = false;
    Util.addClass(this.noFileMsg, "hide");

    const fileText = fs.readFileSync(path, { encoding: "utf8" });
    Events.fileEvent("update", path);
    this.setValue(fileText);

    this.textarea.gotoLine(1);
    this.resize();
  }

  /**
   * エディタにvalueをセット
   * @param value
   */
  private setValue(value: string): string {
    return this.textarea.setValue(value);
  }

  /**
   * エディタのリサイズを行う
   */
  private resize(): void {
    this.textarea.resize();
  }
}

export default new BaseEditor();