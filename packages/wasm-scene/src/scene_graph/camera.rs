use crate::math::*;
// use crate::scene_graph::*;

pub struct Camera {
    pub projection_matrix: Mat4<f32>, 
    pub inverse_world_matrix: Mat4<f32>, 
    // pub node: SceneNode
}

impl Camera {
    pub fn new()-> Self{
        Camera{
            projection_matrix: Mat4::one(),
            inverse_world_matrix:  Mat4::one(),
            // node: SceneNode
        }
    }

    pub fn update_projection(&mut self, mat: &[f32]){
        self.projection_matrix.a1 = mat[0];
        self.projection_matrix.a2 = mat[1];
        self.projection_matrix.a3 = mat[2];
        self.projection_matrix.a4 = mat[3];
        
        self.projection_matrix.b1 = mat[4];
        self.projection_matrix.b2 = mat[5];
        self.projection_matrix.b3 = mat[6];
        self.projection_matrix.b4 = mat[7];

        self.projection_matrix.c1 = mat[8];
        self.projection_matrix.c2 = mat[9];
        self.projection_matrix.c3 = mat[10];
        self.projection_matrix.c4 = mat[11];

        self.projection_matrix.d1 = mat[12];
        self.projection_matrix.d2 = mat[13];
        self.projection_matrix.d3 = mat[14];
        self.projection_matrix.d4 = mat[15];
    }

    pub fn update_inverse(&mut self, mat: &[f32]){
        self.inverse_world_matrix.a1 = mat[0];
        self.inverse_world_matrix.a2 = mat[1];
        self.inverse_world_matrix.a3 = mat[2];
        self.inverse_world_matrix.a4 = mat[3];
        
        self.inverse_world_matrix.b1 = mat[4];
        self.inverse_world_matrix.b2 = mat[5];
        self.inverse_world_matrix.b3 = mat[6];
        self.inverse_world_matrix.b4 = mat[7];

        self.inverse_world_matrix.c1 = mat[8];
        self.inverse_world_matrix.c2 = mat[9];
        self.inverse_world_matrix.c3 = mat[10];
        self.inverse_world_matrix.c4 = mat[11];

        self.inverse_world_matrix.d1 = mat[12];
        self.inverse_world_matrix.d2 = mat[13];
        self.inverse_world_matrix.d3 = mat[14];
        self.inverse_world_matrix.d4 = mat[15];
    }




}