use crate::scene_graph::scene_graph::SceneGraph;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGlProgram, WebGlBuffer, WebGlRenderingContext, WebGlShader, HtmlCanvasElement};

#[wasm_bindgen]
pub struct WebGLRenderer {
    gl: Rc<WebGlRenderingContext>,
    programs: Vec<Program>,
    buffers: Vec<WebGlBuffer>
}

#[wasm_bindgen]
impl WebGLRenderer {

    pub fn new(canvas: HtmlCanvasElement) -> Result<WebGLRenderer, JsValue>{
            
        let context = canvas
        .get_context("webgl")?
        .unwrap()
        .dyn_into::<WebGlRenderingContext>()?;

        Ok(WebGLRenderer{
            gl: Rc::new(context),
            programs: Vec::new(),
            buffers: Vec::new(),
        })
    }

    pub fn make_demo_buffer(&mut self) -> Result<(), JsValue>{
        let vertices: [f32; 9] = [-0.7, -0.7, 0.0, 0.7, -0.7, 0.0, 0.0, 0.7, 0.0];

        let buffer = self.gl.create_buffer().ok_or("failed to create buffer")?;
        self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&buffer));
    
        // Note that `Float32Array::view` is somewhat dangerous (hence the
        // `unsafe`!). This is creating a raw view into our module's
        // `WebAssembly.Memory` buffer, but if we allocate more pages for ourself
        // (aka do a memory allocation in Rust) it'll cause the buffer to change,
        // causing the `Float32Array` to be invalid.
        //
        // As a result, after `Float32Array::view` we have to be very careful not to
        // do any memory allocations before it's dropped.
        unsafe {
            let vert_array = js_sys::Float32Array::view(&vertices);
    
            self.gl.buffer_data_with_array_buffer_view(
                WebGlRenderingContext::ARRAY_BUFFER,
                &vert_array,
                WebGlRenderingContext::STATIC_DRAW,
            );
        }
        self.buffers.push(buffer);
        Ok(())
    }

    pub fn make_demo_program(&mut self) -> Result<(), JsValue>{
        let program = Program::new(self.gl.clone(), 
            r#"
            attribute vec4 position;
            void main() {
                gl_Position = position;
            }
            "#
            ,
            r#"
            void main() {
                gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
             "#
        )?;
        self.programs.push(program);
        Ok(())
    }

    #[wasm_bindgen]
    pub fn render(&self, scene: &SceneGraph){
        self.gl.clear_color(0.0, 0.0, 0.0, 1.0);
        self.gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);

        let buffer = &self.buffers[0];
        self.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(buffer));
        self.gl.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
        self.gl.enable_vertex_attrib_array(0);

        self.gl.use_program(Some(&self.programs[0].program));
        self.gl.draw_arrays(
            WebGlRenderingContext::TRIANGLES,
            0,
            (9 / 3) as i32,
        );
    }

}

struct Program{
    context: Rc<WebGlRenderingContext>,
    program: WebGlProgram,
}

impl Program {
    pub fn new(context: Rc<WebGlRenderingContext>, vertex_shader_str: &str, frag_shader_str: &str) -> Result<Program, String>{
        let vertex_shader = compile_shader(&context, WebGlRenderingContext::VERTEX_SHADER, vertex_shader_str)?;
        let frag_shader = compile_shader(&context, WebGlRenderingContext::FRAGMENT_SHADER, frag_shader_str)?;
        let program = link_program(&context, &vertex_shader, &frag_shader)?;

        Ok(Program{
            context,
            program
        })
    }
}

fn compile_shader(
    context: &WebGlRenderingContext,
    shader_type: u32,
    source: &str,
) -> Result<WebGlShader, String> {
    let shader = context
        .create_shader(shader_type)
        .ok_or_else(|| String::from("Unable to create shader object"))?;
    context.shader_source(&shader, source);
    context.compile_shader(&shader);

    if context
        .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(shader)
    } else {
        Err(context
            .get_shader_info_log(&shader)
            .unwrap_or_else(|| String::from("Unknown error creating shader")))
    }
}

fn link_program(
    context: &WebGlRenderingContext,
    vert_shader: &WebGlShader,
    frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
    let program = context
        .create_program()
        .ok_or_else(|| String::from("Unable to create shader object"))?;

    context.attach_shader(&program, vert_shader);
    context.attach_shader(&program, frag_shader);
    context.link_program(&program);

    if context
        .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
        .as_bool()
        .unwrap_or(false)
    {
        Ok(program)
    } else {
        Err(context
            .get_program_info_log(&program)
            .unwrap_or_else(|| String::from("Unknown error creating program object")))
    }
}


// #[wasm_bindgen(start)]
// pub fn start() -> Result<(), JsValue> {
//     let document = web_sys::window().unwrap().document().unwrap();
//     let canvas = document.get_element_by_id("canvas").unwrap();
//     let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into::<web_sys::HtmlCanvasElement>()?;

//     let context = canvas
//         .get_context("webgl")?
//         .unwrap()
//         .dyn_into::<WebGlRenderingContext>()?;

//     let vert_shader = compile_shader(
//         &context,
//         WebGlRenderingContext::VERTEX_SHADER,
//         r#"
//         attribute vec4 position;
//         void main() {
//             gl_Position = position;
//         }
//     "#,
//     )?;
//     let frag_shader = compile_shader(
//         &context,
//         WebGlRenderingContext::FRAGMENT_SHADER,
//         r#"
//         void main() {
//             gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
//         }
//     "#,
//     )?;
//     let program = link_program(&context, &vert_shader, &frag_shader)?;
//     context.use_program(Some(&program));

//     let vertices: [f32; 9] = [-0.7, -0.7, 0.0, 0.7, -0.7, 0.0, 0.0, 0.7, 0.0];

//     let buffer = context.create_buffer().ok_or("failed to create buffer")?;
//     context.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&buffer));

//     // Note that `Float32Array::view` is somewhat dangerous (hence the
//     // `unsafe`!). This is creating a raw view into our module's
//     // `WebAssembly.Memory` buffer, but if we allocate more pages for ourself
//     // (aka do a memory allocation in Rust) it'll cause the buffer to change,
//     // causing the `Float32Array` to be invalid.
//     //
//     // As a result, after `Float32Array::view` we have to be very careful not to
//     // do any memory allocations before it's dropped.
//     unsafe {
//         let vert_array = js_sys::Float32Array::view(&vertices);

//         context.buffer_data_with_array_buffer_view(
//             WebGlRenderingContext::ARRAY_BUFFER,
//             &vert_array,
//             WebGlRenderingContext::STATIC_DRAW,
//         );
//     }

//     context.vertex_attrib_pointer_with_i32(0, 3, WebGlRenderingContext::FLOAT, false, 0, 0);
//     context.enable_vertex_attrib_array(0);

//     context.clear_color(0.0, 0.0, 0.0, 1.0);
//     context.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);

//     context.draw_arrays(
//         WebGlRenderingContext::TRIANGLES,
//         0,
//         (vertices.len() / 3) as i32,
//     );
//     Ok(())
// }
