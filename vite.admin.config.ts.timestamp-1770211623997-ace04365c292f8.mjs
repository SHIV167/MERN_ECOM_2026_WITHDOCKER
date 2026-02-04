// vite.admin.config.ts
import { defineConfig, loadEnv } from "file:///E:/WINDSURF_PRODUCTION_2025/ECOMMERCE_KAMA_MERN_2025/EcommercePro-main/node_modules/vite/dist/node/index.js";
import react from "file:///E:/WINDSURF_PRODUCTION_2025/ECOMMERCE_KAMA_MERN_2025/EcommercePro-main/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "E:\\WINDSURF_PRODUCTION_2025\\ECOMMERCE_KAMA_MERN_2025\\EcommercePro-main";
var vite_admin_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backend = env.VITE_API_URL || "http://localhost:5000";
  return {
    root: path.resolve(__vite_injected_original_dirname, "admin"),
    base: "/",
    server: {
      port: 5174,
      open: "/admin/",
      proxy: {
        "/api": {
          target: backend,
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "admin", "src"),
        "@shared": path.resolve(__vite_injected_original_dirname, "shared"),
        "@assets": path.resolve(__vite_injected_original_dirname, "attached_assets")
      }
    },
    build: {
      outDir: path.resolve(__vite_injected_original_dirname, "dist/public/admin"),
      emptyOutDir: false
    }
  };
});
export {
  vite_admin_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5hZG1pbi5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxXSU5EU1VSRl9QUk9EVUNUSU9OXzIwMjVcXFxcRUNPTU1FUkNFX0tBTUFfTUVSTl8yMDI1XFxcXEVjb21tZXJjZVByby1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxXSU5EU1VSRl9QUk9EVUNUSU9OXzIwMjVcXFxcRUNPTU1FUkNFX0tBTUFfTUVSTl8yMDI1XFxcXEVjb21tZXJjZVByby1tYWluXFxcXHZpdGUuYWRtaW4uY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9XSU5EU1VSRl9QUk9EVUNUSU9OXzIwMjUvRUNPTU1FUkNFX0tBTUFfTUVSTl8yMDI1L0Vjb21tZXJjZVByby1tYWluL3ZpdGUuYWRtaW4uY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG4vL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuICBjb25zdCBiYWNrZW5kID0gZW52LlZJVEVfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo1MDAwJztcbiAgXG4gIHJldHVybiB7XG4gICAgcm9vdDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2FkbWluJyksXG4gICAgYmFzZTogJy8nLFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogNTE3NCxcbiAgICAgIG9wZW46ICcvYWRtaW4vJyxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogYmFja2VuZCxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnYWRtaW4nLCAnc3JjJyksXG4gICAgICAgICdAc2hhcmVkJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NoYXJlZCcpLFxuICAgICAgICAnQGFzc2V0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdhdHRhY2hlZF9hc3NldHMnKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZGlzdC9wdWJsaWMvYWRtaW4nKSxcbiAgICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdaLFNBQVMsY0FBYyxlQUFlO0FBQzliLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyw0QkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksQ0FBQztBQUN2QyxRQUFNLFVBQVUsSUFBSSxnQkFBZ0I7QUFFcEMsU0FBTztBQUFBLElBQ0wsTUFBTSxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3JDLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxTQUFTLEtBQUs7QUFBQSxRQUMzQyxXQUFXLEtBQUssUUFBUSxrQ0FBVyxRQUFRO0FBQUEsUUFDM0MsV0FBVyxLQUFLLFFBQVEsa0NBQVcsaUJBQWlCO0FBQUEsTUFDdEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRLEtBQUssUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxNQUNuRCxhQUFhO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
