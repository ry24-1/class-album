import os
import shutil
import subprocess
import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import queue

msg_queue = queue.Queue()

def run_ffmpeg(cmd):
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def process_jpg(file_path, filename_no_ext):
    # 1. pre目录400宽缩略图
    cmd_thumb = [
        "ffmpeg", "-y", "-i", file_path,
        "-vf", "scale=400:-2",
        "-q:v", "60",
        "-map_metadata", "-1",
        f"pre/{filename_no_ext}.webp"
    ]
    run_ffmpeg(cmd_thumb)

    # 2. 原图尺寸长边1920
    cmd_origin = [
        "ffmpeg", "-y", "-i", file_path,
        "-vf", "scale=w='min(1920,iw)':h='min(1920,ih)':force_original_aspect_ratio=decrease",
        "-q:v", "85",
        "-map_metadata", "-1",
        f"{filename_no_ext}.webp"
    ]
    run_ffmpeg(cmd_origin)

    # 移动原图到 nor
    shutil.move(file_path, f"nor/{os.path.basename(file_path)}")

def task():
    # 创建文件夹
    os.makedirs("nor", exist_ok=True)
    os.makedirs("pre", exist_ok=True)
    msg_queue.put(("log", "已确认 nor / pre 文件夹"))

    # 收集jpg
    jpg_list = []
    for f in os.listdir("."):
        fp = os.path.abspath(f)
        if os.path.isfile(fp) and f.lower().endswith(".jpg"):
            jpg_list.append(fp)
    total = len(jpg_list)
    msg_queue.put(("total", total))
    if total == 0:
        msg_queue.put(("log", "当前目录未找到任何jpg文件"))
        msg_queue.put(("finish",))
        return

    for idx, path in enumerate(jpg_list, 1):
        base_name = os.path.basename(path)
        name_no_ext = os.path.splitext(base_name)[0]
        msg_queue.put(("progress", idx, total, base_name))
        msg_queue.put(("log", f"正在处理：{base_name}"))
        process_jpg(path, name_no_ext)

    msg_queue.put(("log", "全部图片处理完成！"))
    msg_queue.put(("finish",))

class AppGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("图片批量生成工具（复刻zed photo.bat）")
        self.root.geometry("640x340")
        self.root.resizable(False, False)
        self.total = 0

        # 进度条区域
        frame_prog = ttk.LabelFrame(root, text="处理进度")
        frame_prog.pack(fill="x", padx=10, pady=5)
        self.prog_var = tk.DoubleVar()
        self.bar = ttk.Progressbar(frame_prog, variable=self.prog_var, maximum=100)
        self.bar.pack(fill="x", padx=6, pady=6)
        self.label_tip = ttk.Label(frame_prog, text="等待扫描文件...")
        self.label_tip.pack()

        # 日志框
        frame_log = ttk.LabelFrame(root, text="运行日志")
        frame_log.pack(fill="both", expand=True, padx=10, pady=5)
        self.log_text = scrolledtext.ScrolledText(frame_log, state="disabled")
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)

        self.poll_msg()
        # 打开窗口自动后台执行任务
        threading.Thread(target=task, daemon=True).start()

    def add_log(self, text):
        self.log_text.config(state="normal")
        self.log_text.insert(tk.END, text + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state="disabled")

    def poll_msg(self):
        try:
            while True:
                msg = msg_queue.get_nowait()
                m_type = msg[0]
                args = msg[1:]
                if m_type == "total":
                    self.total = args[0]
                elif m_type == "progress":
                    idx, total, fname = args
                    pct = idx / total * 100
                    self.prog_var.set(pct)
                    self.label_tip.config(text=f"{idx}/{total} 当前：{fname}")
                elif m_type == "log":
                    self.add_log(args[0])
                elif m_type == "finish":
                    self.label_tip.config(text="✅ 全部任务执行完毕")
        except queue.Empty:
            pass
        self.root.after(50, self.poll_msg)

if __name__ == "__main__":
    win = tk.Tk()
    AppGUI(win)
    win.mainloop()